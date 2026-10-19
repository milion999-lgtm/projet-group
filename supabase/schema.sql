-- EduVerse 3D initial schema. Run in the Supabase SQL editor for a connected deployment.
create extension if not exists pgcrypto;

create type public.app_role as enum ('student', 'instructor', 'admin');
create type public.course_status as enum ('draft', 'review', 'published', 'archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  role public.app_role not null default 'student',
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  slug text not null unique,
  subtitle text,
  description text not null default '',
  category text not null,
  level text not null check (level in ('Beginner','Intermediate','Advanced','All levels')),
  price_cents integer not null default 0 check (price_cents >= 0),
  thumbnail_path text,
  status public.course_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index courses_instructor_idx on public.courses(instructor_id);
create index courses_catalog_idx on public.courses(status, category, level, published_at desc);

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position integer not null check (position >= 0),
  created_at timestamptz not null default now(),
  unique(course_id, position)
);
create index course_modules_course_idx on public.course_modules(course_id, position);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null,
  description text not null default '',
  position integer not null check (position >= 0),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  video_path text,
  is_preview boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(module_id, position)
);
create index lessons_module_idx on public.lessons(module_id, position);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(student_id, course_id)
);
create index enrollments_course_idx on public.enrollments(course_id);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz,
  last_position_seconds integer not null default 0 check (last_position_seconds >= 0),
  updated_at timestamptz not null default now(),
  unique(student_id, lesson_id)
);
create index lesson_progress_student_idx on public.lesson_progress(student_id, updated_at desc);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null unique references public.lessons(id) on delete cascade,
  title text not null,
  passing_score integer not null default 70 check (passing_score between 0 and 100),
  created_at timestamptz not null default now()
);
create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  prompt text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array'),
  explanation text not null default '',
  position integer not null check (position >= 0),
  unique(quiz_id, position)
);
create index quiz_questions_quiz_idx on public.quiz_questions(quiz_id, position);

-- Correct answers live separately so enrolled learners never receive answer keys.
create table public.quiz_answer_keys (
  question_id uuid primary key references public.quiz_questions(id) on delete cascade,
  correct_option integer not null check (correct_option >= 0)
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  answers jsonb not null default '[]'::jsonb,
  passed boolean not null default false,
  attempted_at timestamptz not null default now()
);
create index quiz_attempts_student_idx on public.quiz_attempts(student_id, attempted_at desc);
create index quiz_attempts_quiz_idx on public.quiz_attempts(quiz_id, attempted_at desc);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_id, course_id)
);
create index reviews_course_idx on public.reviews(course_id, created_at desc);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  certificate_number text not null unique default encode(gen_random_bytes(12), 'hex'),
  issued_at timestamptz not null default now(),
  unique(student_id, course_id)
);
create index certificates_student_idx on public.certificates(student_id, issued_at desc);

create table public.wishlists (
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(student_id, course_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null default '',
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id, created_at desc);

-- Keep profile roles out of user-editable signup metadata. Administrators should
-- grant elevated roles from a trusted server or the Supabase dashboard.
create or replace function public.current_role()
returns public.app_role language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select coalesce(public.current_role() = 'admin', false) $$;
create or replace function public.owns_course(target_course uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.courses where id=target_course and instructor_id=auth.uid()) $$;
create or replace function public.enrolled_in(target_course uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.enrollments where course_id=target_course and student_id=auth.uid()) $$;

create or replace function public.create_profile_for_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles(id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name',''));
  return new;
end $$;
create trigger auth_user_profile after insert on auth.users for each row execute function public.create_profile_for_user();

create or replace function public.protect_profile_role()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only an administrator can change account roles';
  end if;
  return new;
end $$;
create trigger profile_role_guard before update on public.profiles for each row execute function public.protect_profile_role();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answer_keys enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.reviews enable row level security;
alter table public.certificates enable row level security;
alter table public.wishlists enable row level security;
alter table public.notifications enable row level security;

create policy "Profiles visible to self, course peers and admins" on public.profiles for select to authenticated
using (id=auth.uid() or public.is_admin() or exists (select 1 from public.courses c join public.enrollments e on e.course_id=c.id where c.instructor_id=auth.uid() and e.student_id=profiles.id));
create policy "Users update their own profile" on public.profiles for update to authenticated
using (id=auth.uid() or public.is_admin()) with check (id=auth.uid() or public.is_admin());

create policy "Published courses visible; owners and admins see all" on public.courses for select to anon, authenticated
using (status='published' or instructor_id=auth.uid() or public.is_admin());
create policy "Instructors create courses" on public.courses for insert to authenticated
with check (instructor_id=auth.uid() and public.current_role() in ('instructor','admin'));
create policy "Course owners and admins manage courses" on public.courses for update to authenticated
using (instructor_id=auth.uid() or public.is_admin()) with check (instructor_id=auth.uid() or public.is_admin());
create policy "Course owners and admins delete courses" on public.courses for delete to authenticated
using (instructor_id=auth.uid() or public.is_admin());

create policy "Modules visible with published courses or access" on public.course_modules for select to anon, authenticated
using (exists(select 1 from public.courses c where c.id=course_id and (c.status='published' or c.instructor_id=auth.uid() or public.is_admin() or public.enrolled_in(c.id))));
create policy "Course owners manage modules" on public.course_modules for all to authenticated
using (public.owns_course(course_id) or public.is_admin()) with check (public.owns_course(course_id) or public.is_admin());
create policy "Lessons visible with published courses or access" on public.lessons for select to anon, authenticated
using (is_preview or exists(select 1 from public.course_modules m join public.courses c on c.id=m.course_id where m.id=module_id and (c.instructor_id=auth.uid() or public.is_admin() or public.enrolled_in(c.id))));
create policy "Course owners manage lessons" on public.lessons for all to authenticated
using (exists(select 1 from public.course_modules m where m.id=module_id and (public.owns_course(m.course_id) or public.is_admin())))
with check (exists(select 1 from public.course_modules m where m.id=module_id and (public.owns_course(m.course_id) or public.is_admin())));

create policy "Enrollment visible to student or course owner" on public.enrollments for select to authenticated
using (student_id=auth.uid() or public.is_admin() or public.owns_course(course_id));
create policy "Students enroll themselves in published courses" on public.enrollments for insert to authenticated
with check (student_id=auth.uid() and exists(select 1 from public.courses where id=course_id and status='published' and price_cents=0));
create policy "Student or admin removes enrollment" on public.enrollments for delete to authenticated
using (student_id=auth.uid() or public.is_admin());

create policy "Students manage own lesson progress" on public.lesson_progress for all to authenticated
using (student_id=auth.uid() or public.is_admin()) with check (student_id=auth.uid() and public.enrolled_in((select m.course_id from public.lessons l join public.course_modules m on m.id=l.module_id where l.id=lesson_id)) or public.is_admin());
create policy "Quizzes visible with course access" on public.quizzes for select to authenticated
using (exists(select 1 from public.lessons l join public.course_modules m on m.id=l.module_id where l.id=lesson_id and (public.enrolled_in(m.course_id) or public.owns_course(m.course_id) or public.is_admin())));
create policy "Owners manage quizzes" on public.quizzes for all to authenticated
using (exists(select 1 from public.lessons l join public.course_modules m on m.id=l.module_id where l.id=lesson_id and (public.owns_course(m.course_id) or public.is_admin())))
with check (exists(select 1 from public.lessons l join public.course_modules m on m.id=l.module_id where l.id=lesson_id and (public.owns_course(m.course_id) or public.is_admin())));
create policy "Questions visible with quiz access" on public.quiz_questions for select to authenticated
using (exists(select 1 from public.quizzes q join public.lessons l on l.id=q.lesson_id join public.course_modules m on m.id=l.module_id where q.id=quiz_id and (public.enrolled_in(m.course_id) or public.owns_course(m.course_id) or public.is_admin())));
create policy "Owners manage quiz questions" on public.quiz_questions for all to authenticated
using (exists(select 1 from public.quizzes q join public.lessons l on l.id=q.lesson_id join public.course_modules m on m.id=l.module_id where q.id=quiz_id and (public.owns_course(m.course_id) or public.is_admin())))
with check (exists(select 1 from public.quizzes q join public.lessons l on l.id=q.lesson_id join public.course_modules m on m.id=l.module_id where q.id=quiz_id and (public.owns_course(m.course_id) or public.is_admin())));
create policy "Course owners manage answer keys" on public.quiz_answer_keys for all to authenticated
using (exists(select 1 from public.quiz_questions qq join public.quizzes q on q.id=qq.quiz_id join public.lessons l on l.id=q.lesson_id join public.course_modules m on m.id=l.module_id where qq.id=question_id and (public.owns_course(m.course_id) or public.is_admin())))
with check (exists(select 1 from public.quiz_questions qq join public.quizzes q on q.id=qq.quiz_id join public.lessons l on l.id=q.lesson_id join public.course_modules m on m.id=l.module_id where qq.id=question_id and (public.owns_course(m.course_id) or public.is_admin())));
create policy "Students see and submit their quiz attempts" on public.quiz_attempts for select to authenticated
using (student_id=auth.uid() or public.is_admin());

create or replace function public.submit_quiz_attempt(target_quiz uuid, submitted_answers jsonb)
returns table(attempt_id uuid, score integer, passed boolean)
language plpgsql security definer set search_path = public
as $$
declare
  actor uuid := auth.uid();
  question_total integer;
  correct_total integer;
  pass_mark integer;
  final_score integer;
  final_passed boolean;
  created_attempt uuid;
begin
  if actor is null then raise exception 'Authentication required'; end if;
  if jsonb_typeof(submitted_answers) <> 'array' then raise exception 'Answers must be an array'; end if;
  if not exists(
    select 1 from public.quizzes q join public.lessons l on l.id=q.lesson_id
      join public.course_modules m on m.id=l.module_id
    where q.id=target_quiz and public.enrolled_in(m.course_id)
  ) then raise exception 'Course enrollment required'; end if;
  select count(*), q.passing_score into question_total, pass_mark
    from public.quiz_questions qq join public.quizzes q on q.id=qq.quiz_id
    where q.id=target_quiz group by q.passing_score;
  if coalesce(question_total,0)=0 then raise exception 'Quiz has no questions'; end if;
  select count(distinct qq.id) into correct_total
    from jsonb_to_recordset(submitted_answers) as a(question_id uuid, selected_option integer)
    join public.quiz_questions qq on qq.id=a.question_id and qq.quiz_id=target_quiz
    join public.quiz_answer_keys k on k.question_id=qq.id and k.correct_option=a.selected_option;
  final_score := round((correct_total::numeric / question_total) * 100);
  final_passed := final_score >= pass_mark;
  insert into public.quiz_attempts(student_id,quiz_id,score,answers,passed)
    values(actor,target_quiz,final_score,submitted_answers,final_passed) returning id into created_attempt;
  return query select created_attempt, final_score, final_passed;
end $$;
revoke all on function public.submit_quiz_attempt(uuid,jsonb) from public, anon;
grant execute on function public.submit_quiz_attempt(uuid,jsonb) to authenticated;

create policy "Reviews visible to all" on public.reviews for select to anon, authenticated using (true);
create policy "Enrolled students write their own review" on public.reviews for insert to authenticated
with check (student_id=auth.uid() and public.enrolled_in(course_id));
create policy "Review authors update or remove" on public.reviews for update to authenticated using (student_id=auth.uid() or public.is_admin()) with check (student_id=auth.uid() or public.is_admin());
create policy "Review authors delete" on public.reviews for delete to authenticated using (student_id=auth.uid() or public.is_admin());
create policy "Certificates visible to owner or course owner" on public.certificates for select to authenticated
using (student_id=auth.uid() or public.is_admin() or public.owns_course(course_id));
create policy "Students view their wishlist" on public.wishlists for select to authenticated using (student_id=auth.uid() or public.is_admin());
create policy "Students manage their wishlist" on public.wishlists for all to authenticated using (student_id=auth.uid() or public.is_admin()) with check (student_id=auth.uid() or public.is_admin());
create policy "Users manage their notifications" on public.notifications for all to authenticated using (user_id=auth.uid() or public.is_admin()) with check (user_id=auth.uid() or public.is_admin());

-- Store course assets in a private bucket. Issue short-lived signed URLs only after
-- checking enrollment; public thumbnails may instead use a separate public bucket.
insert into storage.buckets(id, name, public) values ('course-assets','course-assets',false) on conflict (id) do nothing;
create policy "Course owners upload course assets" on storage.objects for insert to authenticated
with check (bucket_id='course-assets' and (storage.foldername(name))[1]=auth.uid()::text and public.current_role() in ('instructor','admin'));
create policy "Course owners and admins update assets" on storage.objects for update to authenticated
using (bucket_id='course-assets' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()))
with check (bucket_id='course-assets' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));
create policy "Course owners and admins delete assets" on storage.objects for delete to authenticated
using (bucket_id='course-assets' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));
