import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, Check, KeyRound, Link2, Mail, Save, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../App'
import { supabase } from '../lib/supabase'
import './account.css'

type Profile = { email: string; phone: string; name: string }
type OAuthProvider = 'google' | 'github'
const oauthProviders: { id: OAuthProvider; label: string }[] = [
  { id: 'google', label: 'Google' },
  { id: 'github', label: 'GitHub' },
]

function GoogleLogo() {
  return <svg className="account-brand-logo google-logo" aria-hidden="true" viewBox="0 0 48 48">
    <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.8-3.5 6.1-8.7 6.1-15Z"/>
    <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2A20 20 0 0 0 24 44Z"/>
    <path fill="#FBBC05" d="M12.6 27.5a12 12 0 0 1 0-7v-5.2H5.8a20 20 0 0 0 0 17.4l6.8-5.2Z"/>
    <path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.8 15.3l6.8 5.2C14.2 15.6 18.7 12 24 12Z"/>
  </svg>
}

function GitHubLogo() {
  return <svg className="account-brand-logo github-logo" aria-hidden="true" viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.59 1.21 3.22.93.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.51 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.67.11 2.95.72.78 1.15 1.77 1.15 2.99 0 4.28-2.61 5.22-5.1 5.5.4.35.75 1.02.75 2.06v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/>
  </svg>
}

function ProviderLogo({ provider }: { provider: OAuthProvider }) {
  return provider === 'google' ? <GoogleLogo/> : <GitHubLogo/>
}

export default function AccountSettings() {
  const { user } = useApp()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentEmail, setCurrentEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [pendingPhone, setPendingPhone] = useState('')
  const [identities, setIdentities] = useState<string[]>([])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingPhone, setSavingPhone] = useState(false)
  const [linking, setLinking] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let mounted = true
    async function loadProfile() {
      if (!supabase) { setError('Le service de compte n’est pas configuré.'); setLoading(false); return }
      try {
        const { data, error: authError } = await supabase.auth.getUser()
        if (authError || !data.user) { setError('Impossible de charger votre compte. Reconnectez-vous, puis réessayez.'); return }
        const { data: identityData } = await supabase.auth.getUserIdentities()
        if (!mounted) return
        const authUser = data.user
        const current = authUser.email ?? ''
        const displayName = String(authUser.user_metadata?.display_name ?? authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? '')
        const currentPhone = authUser.phone ?? ''
        setProfile({ email: current, phone: currentPhone, name: displayName })
        setName(displayName)
        setEmail(current)
        setCurrentEmail(current)
        setPhone(currentPhone)
        setIdentities(identityData?.identities?.map(identity => identity.provider) ?? authUser.identities?.map(identity => identity.provider) ?? [])
      } catch {
        if (mounted) setError('Impossible de charger votre compte. Vérifiez votre connexion puis réessayez.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void loadProfile()
    return () => { mounted = false }
  }, [])

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!supabase || !profile) { setError('Impossible de modifier le compte actuellement.'); return }
    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()
    if (cleanName.length < 2 || cleanName.length > 80) { setError('Le nom doit contenir entre 2 et 80 caractères.'); return }
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) { setError('Entrez une adresse e-mail valide.'); return }
    setSavingProfile(true)
    try {
      const updates: { data: { display_name: string }; email?: string } = { data: { display_name: cleanName } }
      const emailChanged = cleanEmail !== currentEmail
      if (emailChanged) updates.email = cleanEmail
      const { data, error: updateError } = await supabase.auth.updateUser(updates)
      if (updateError || !data.user) { setError('La modification n’a pas abouti. Vérifiez les informations et réessayez.'); return }
      const confirmedEmail = data.user.email ?? currentEmail
      setCurrentEmail(confirmedEmail)
      setEmail(emailChanged ? cleanEmail : confirmedEmail)
      setProfile({ ...profile, email: confirmedEmail, name: cleanName })
      setNotice(emailChanged
        ? 'Votre nom a été enregistré. Confirmez la nouvelle adresse depuis l’e-mail envoyé par Supabase avant qu’elle remplace l’adresse actuelle.'
        : 'Votre nom a été mis à jour.')
    } catch {
      setError('La modification n’a pas abouti. Vérifiez votre connexion et réessayez.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!supabase) { setError('Le service de compte n’est pas configuré.'); return }
    if (password.length < 8) { setError('Le nouveau mot de passe doit contenir au moins 8 caractères.'); return }
    if (password !== confirmPassword) { setError('Les deux nouveaux mots de passe ne correspondent pas.'); return }
    setSavingPassword(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) { setError('Le mot de passe n’a pas pu être modifié. Vérifiez qu’il respecte les règles du compte.'); return }
      setPassword('')
      setConfirmPassword('')
      if (profile?.email) setIdentities(old => old.includes('email') ? old : [...old, 'email'])
      setNotice('Votre mot de passe EduVerse a été modifié.')
    } catch {
      setError('Le mot de passe n’a pas pu être modifié. Vérifiez votre connexion et réessayez.')
    } finally {
      setSavingPassword(false)
    }
  }

  async function requestPhoneChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!supabase || !profile) { setError('Impossible de modifier le téléphone actuellement.'); return }
    const cleanPhone = phone.replace(/[\s().-]/g, '')
    if (!/^\+[1-9]\d{7,14}$/.test(cleanPhone)) { setError('Entrez le numéro au format international, par exemple +212600000000.'); return }
    if (cleanPhone === profile.phone) { setNotice('Ce numéro est déjà associé à votre compte.'); return }
    setSavingPhone(true)
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({ phone: cleanPhone })
      if (updateError || !data.user) {
        setError('Le numéro n’a pas pu être enregistré. Vérifiez que la connexion par téléphone et le service SMS sont activés dans Supabase.')
        return
      }
      if (data.user.phone === cleanPhone) {
        setProfile({ ...profile, phone: cleanPhone })
        setPhone(cleanPhone)
        setNotice('Votre numéro a été mis à jour.')
      } else {
        setPendingPhone(cleanPhone)
        setPhoneCode('')
        setNotice('Le code de confirmation a été envoyé par SMS au nouveau numéro.')
      }
    } catch {
      setError('Impossible d’envoyer le code SMS. Vérifiez la configuration du service SMS puis réessayez.')
    } finally {
      setSavingPhone(false)
    }
  }

  async function confirmPhoneChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!supabase || !pendingPhone) { setError('Demandez d’abord un code pour le nouveau numéro.'); return }
    const token = phoneCode.trim()
    if (!/^\d{4,8}$/.test(token)) { setError('Entrez le code reçu par SMS.'); return }
    setSavingPhone(true)
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({ phone: pendingPhone, token, type: 'phone_change' })
      if (verifyError || !data.user) { setError('Le code est incorrect ou expiré. Vérifiez-le et réessayez.'); return }
      const confirmedPhone = data.user.phone ?? pendingPhone
      setProfile(old => old ? { ...old, phone: confirmedPhone } : old)
      setPhone(confirmedPhone)
      setPendingPhone('')
      setPhoneCode('')
      setNotice('Votre nouveau numéro a été confirmé et associé à votre compte.')
    } catch {
      setError('La vérification du numéro a échoué. Vérifiez le code et réessayez.')
    } finally {
      setSavingPhone(false)
    }
  }

  async function linkProvider(provider: OAuthProvider) {
    setError('')
    setNotice('')
    if (!supabase) { setError('Le service de compte n’est pas configuré.'); return }
    setLinking(provider)
    try {
      const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}login?next=%2Faccount`
      const { error: linkError } = await supabase.auth.linkIdentity({ provider, options: { redirectTo } })
      if (linkError) {
        setError(`Impossible de relier ${provider === 'google' ? 'Google' : 'GitHub'}. Vérifiez que le fournisseur est activé dans Supabase et que « Allow manual linking » est autorisé dans Authentication → Settings.`)
        setLinking(null)
      }
    } catch {
      setError('La liaison a échoué. Vérifiez la configuration OAuth et les URL de redirection Supabase.')
      setLinking(null)
    }
  }

  return <div className="account-page page-width">
    <Link className="account-back" to="/dashboard"><ArrowLeft size={15}/> Retour à mon espace</Link>
    <header className="account-heading"><span className="eyebrow">ESPACE PERSONNEL</span><h1>Gérer mon compte</h1><p>Modifiez les informations de votre compte EduVerse et choisissez comment vous connecter.</p></header>
    <fieldset className="account-fieldset">
      <legend>Paramètres personnels</legend>
      {loading ? <div className="account-loading" role="status">Chargement de votre compte…</div> : <>
        {profile && <div className="account-identity"><span className="account-avatar">{(profile.name || profile.email || profile.phone || user || 'E').slice(0,1).toUpperCase()}</span><div><strong>{profile.name || profile.email || profile.phone || 'Compte EduVerse'}</strong><small>Compte connecté</small></div><span className="account-active"><Check size={13}/> Actif</span></div>}
        <div className="account-sections">
          <section className="account-section" aria-labelledby="account-profile-heading">
            <div className="account-section-heading"><span className="account-section-icon"><UserRound size={17}/></span><div><h2 id="account-profile-heading">Profil</h2><p>Votre nom affiché et votre adresse de contact.</p></div></div>
            <form className="account-fields" onSubmit={saveProfile}>
              <label htmlFor="account-name">Nom affiché<input id="account-name" name="name" autoComplete="name" maxLength={80} minLength={2} required value={name} onChange={event => setName(event.target.value)} placeholder="Votre nom"/></label>
              <label htmlFor="account-email">Adresse e-mail<input id="account-email" name="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="vous@exemple.fr"/><small>Une nouvelle adresse doit être confirmée par e-mail avant de devenir active.</small></label>
              <button className="button" type="submit" disabled={savingProfile || savingPassword || savingPhone || Boolean(linking)}><Save size={15}/>{savingProfile ? 'Enregistrement…' : 'Enregistrer le profil'}</button>
            </form>
          </section>

          <section className="account-section" aria-labelledby="account-security-heading">
            <div className="account-section-heading"><span className="account-section-icon"><KeyRound size={17}/></span><div><h2 id="account-security-heading">Mot de passe</h2><p>Définissez ou modifiez votre mot de passe EduVerse.</p></div></div>
            <form className="account-fields" onSubmit={savePassword}>
              <label htmlFor="account-password">Nouveau mot de passe<input id="account-password" name="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} placeholder="8 caractères minimum"/></label>
              <label htmlFor="account-password-confirm">Confirmer le mot de passe<input id="account-password-confirm" name="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="Répétez le nouveau mot de passe"/></label>
              <button className="button button-outline" type="submit" disabled={savingPassword || savingProfile || savingPhone || Boolean(linking)}>{savingPassword ? 'Modification…' : 'Modifier le mot de passe'}</button>
              <small className="account-help">Un mot de passe EduVerse peut être utilisé avec une adresse e-mail vérifiée, même si vous vous connectez aussi avec Google ou GitHub.</small>
            </form>
          </section>

          <section className="account-section" aria-labelledby="account-phone-heading">
            <div className="account-section-heading"><span className="account-section-icon"><Mail size={17}/></span><div><h2 id="account-phone-heading">Téléphone</h2><p>Ajoutez ou remplacez votre numéro après confirmation par SMS.</p></div></div>
            <form className="account-fields" onSubmit={pendingPhone ? confirmPhoneChange : requestPhoneChange}>
              {!pendingPhone ? <label htmlFor="account-phone">Numéro international<input id="account-phone" name="tel" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="+212 6 00 00 00 00" maxLength={24} required/><small>Incluez l’indicatif du pays, par exemple +212 pour le Maroc.</small></label> : <><label htmlFor="account-phone-pending">Nouveau numéro<input id="account-phone-pending" value={pendingPhone} readOnly/></label><label htmlFor="account-phone-code">Code reçu par SMS<input id="account-phone-code" name="one-time-code" inputMode="numeric" autoComplete="one-time-code" value={phoneCode} onChange={event => setPhoneCode(event.target.value)} maxLength={8} required placeholder="Code de confirmation"/></label></>}
              <button className="button button-outline" type="submit" disabled={savingPhone || savingProfile || savingPassword || Boolean(linking)}>{savingPhone ? 'Vérification…' : pendingPhone ? 'Confirmer le numéro' : 'Envoyer un code SMS'}</button>
            </form>
          </section>

          <section className="account-section" aria-labelledby="account-providers-heading">
            <div className="account-section-heading"><span className="account-section-icon"><Link2 size={17}/></span><div><h2 id="account-providers-heading">Méthodes de connexion</h2><p>Reliez Google et GitHub au même compte EduVerse.</p></div></div>
            <div className="account-provider-list">
              <div className="account-provider-row">
                <div className="account-provider-name"><span className="account-provider-logo account-logo-email"><Mail size={18}/></span><div><strong>E-mail</strong><small>{identities.includes('email') ? 'Adresse et mot de passe activés' : profile?.email ? 'Ajoutez un mot de passe pour vous connecter par e-mail' : 'Ajoutez puis confirmez votre adresse e-mail'}</small></div></div>
                {identities.includes('email') ? <span className="account-provider-linked"><Check size={13}/> Relié</span> : <a className="button button-outline account-provider-action" href={profile?.email ? '#account-password' : '#account-email'}>{profile?.email ? 'Créer un mot de passe' : 'Ajouter un e-mail'}</a>}
              </div>
              {oauthProviders.map(provider => {
                const connected = identities.includes(provider.id)
                return <div className="account-provider-row" key={provider.id}>
                  <div className="account-provider-name"><span className={`account-provider-logo account-logo-${provider.id}`}><ProviderLogo provider={provider.id}/></span><div><strong>{provider.label}</strong><small>{connected ? 'Relié à ce compte' : 'Pas encore relié'}</small></div></div>
                  {connected ? <span className="account-provider-linked"><Check size={13}/> Relié</span> : <button className="button button-outline" type="button" onClick={() => void linkProvider(provider.id)} disabled={Boolean(linking) || savingProfile || savingPassword || savingPhone}>{linking === provider.id ? 'Redirection…' : `Relier ${provider.label}`}</button>}
                </div>
              })}
            </div>
            <small className="account-help">Google et GitHub doivent être activés dans Supabase. Pour relier des fournisseurs à ce compte, « Allow manual linking » doit être autorisé dans Authentication → Settings.</small>
          </section>
        </div>
      </>}
      {error && <div className="account-message account-error" role="alert">{error}</div>}
      {notice && <div className="account-message account-success" role="status">{notice}</div>}
    </fieldset>
  </div>
}
