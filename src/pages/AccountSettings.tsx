import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, Check, KeyRound, Mail, Save, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../App'
import { supabase } from '../lib/supabase'
import './account.css'

type Profile = { email: string; phone: string; name: string; userId: string }

export default function AccountSettings() {
  const { user } = useApp()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentEmail, setCurrentEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [canChangePassword, setCanChangePassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let mounted = true
    async function loadProfile() {
      if (!supabase) { setError('Le service de compte n’est pas configuré.'); setLoading(false); return }
      try {
        const { data, error: authError } = await supabase.auth.getUser()
        if (authError || !data.user) { setError('Impossible de charger votre compte. Reconnectez-vous, puis réessayez.'); return }
        if (!mounted) return
        const authUser = data.user
        const current = authUser.email ?? ''
        const displayName = String(authUser.user_metadata?.display_name ?? authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? '')
        setProfile({ email: current, phone: authUser.phone ?? '', name: displayName, userId: authUser.id })
        setCanChangePassword(Array.isArray(authUser.app_metadata?.providers) && authUser.app_metadata.providers.includes('email'))
        setName(displayName)
        setEmail(current)
        setCurrentEmail(current)
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
      const nextEmail = data.user.email ?? currentEmail
      setCurrentEmail(nextEmail)
      setEmail(emailChanged ? cleanEmail : nextEmail)
      setProfile({ ...profile, email: nextEmail, name: cleanName })
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
      setNotice('Votre mot de passe a été modifié.')
    } catch {
      setError('Le mot de passe n’a pas pu être modifié. Vérifiez votre connexion et réessayez.')
    } finally {
      setSavingPassword(false)
    }
  }

  return <div className="account-page page-width">
    <Link className="account-back" to="/dashboard"><ArrowLeft size={15}/> Retour à mon espace</Link>
    <header className="account-heading"><span className="eyebrow">ESPACE PERSONNEL</span><h1>Mon compte</h1><p>Gérez les informations de connexion et le nom affiché sur votre espace EduVerse.</p></header>
    {loading ? <div className="account-panel" role="status">Chargement de votre compte…</div> : <>
      {profile && <div className="account-identity"><span className="account-avatar">{(profile.name || profile.email || profile.phone || user || 'E').slice(0,1).toUpperCase()}</span><div><strong>{profile.name || profile.email || profile.phone || 'Compte EduVerse'}</strong><small>Identifiant du compte · {profile.userId.slice(0,8)}…</small></div><span className="account-active"><Check size={13}/> Connecté</span></div>}
      <div className="account-grid">
        <form className="account-panel account-form" onSubmit={saveProfile}>
          <div className="account-panel-heading"><span className="account-panel-icon"><UserRound size={18}/></span><div><h2>Profil</h2><p>Ces informations sont privées et associées à votre compte.</p></div></div>
          <label htmlFor="account-name">Nom affiché<input id="account-name" name="name" autoComplete="name" maxLength={80} minLength={2} required value={name} onChange={event => setName(event.target.value)} placeholder="Votre nom"/></label>
          <label htmlFor="account-email">Adresse e-mail<input id="account-email" name="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder={profile?.phone ? 'Ajoutez un e-mail (facultatif)' : 'vous@exemple.fr'}/><small>Une nouvelle adresse doit être confirmée par e-mail avant de devenir active.</small></label>
          {profile?.phone && <label htmlFor="account-phone">Téléphone associé<input id="account-phone" value={profile.phone} readOnly/><small>Le changement de numéro nécessite une vérification SMS; contactez l’administrateur pour le moment.</small></label>}
          <button className="button" type="submit" disabled={savingProfile || savingPassword}><Save size={15}/>{savingProfile ? 'Enregistrement…' : 'Enregistrer le profil'}</button>
        </form>
        {canChangePassword ? <form className="account-panel account-form" onSubmit={savePassword}>
          <div className="account-panel-heading"><span className="account-panel-icon"><KeyRound size={18}/></span><div><h2>Sécurité</h2><p>Choisissez un mot de passe long, unique et difficile à deviner.</p></div></div>
          <label htmlFor="account-password">Nouveau mot de passe<input id="account-password" name="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} placeholder="8 caractères minimum"/></label>
          <label htmlFor="account-password-confirm">Confirmer le mot de passe<input id="account-password-confirm" name="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="Répétez le nouveau mot de passe"/></label>
          <button className="button button-outline" type="submit" disabled={savingPassword || savingProfile}><KeyRound size={15}/>{savingPassword ? 'Modification…' : 'Modifier le mot de passe'}</button>
          <div className="account-security-note"><Mail size={15}/><span>Si vous vous connectez avec Google ou GitHub, votre mot de passe reste géré par ce fournisseur.</span></div>
        </form>
      </div>
    </>}
    {error && <div className="account-message account-error" role="alert">{error}</div>}
    {notice && <div className="account-message account-success" role="status">{notice}</div>}
  </div>
}
