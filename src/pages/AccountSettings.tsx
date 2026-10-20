import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, Check, Github, KeyRound, Mail, Save, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../App'
import { supabase } from '../lib/supabase'
import './account.css'

type Profile = { email: string; phone: string; name: string; userId: string }
type OAuthProvider = 'google' | 'github'
const oauthProviders: { id: OAuthProvider; label: string }[] = [
  { id: 'google', label: 'Google' },
  { id: 'github', label: 'GitHub' },
]

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
        setProfile({ email: current, phone: currentPhone, name: displayName, userId: authUser.id })
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
    <header className="account-heading"><span className="eyebrow">ESPACE PERSONNEL</span><h1>Mon compte</h1><p>Modifiez vos informations, votre mot de passe et vos moyens de connexion.</p></header>
    {loading ? <div className="account-panel" role="status">Chargement de votre compte…</div> : <>
      {profile && <div className="account-identity"><span className="account-avatar">{(profile.name || profile.email || profile.phone || user || 'E').slice(0,1).toUpperCase()}</span><div><strong>{profile.name || profile.email || profile.phone || 'Compte EduVerse'}</strong><small>Identifiant du compte · {profile.userId.slice(0,8)}…</small></div><span className="account-active"><Check size={13}/> Connecté</span></div>}
      <div className="account-grid">
        <form className="account-panel account-form" onSubmit={saveProfile}>
          <div className="account-panel-heading"><span className="account-panel-icon"><UserRound size={18}/></span><div><h2>Profil</h2><p>Ces informations sont privées et associées à votre compte.</p></div></div>
          <label htmlFor="account-name">Nom affiché<input id="account-name" name="name" autoComplete="name" maxLength={80} minLength={2} required value={name} onChange={event => setName(event.target.value)} placeholder="Votre nom"/></label>
          <label htmlFor="account-email">Adresse e-mail<input id="account-email" name="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder={profile?.phone ? 'Ajoutez un e-mail (facultatif)' : 'vous@exemple.fr'}/><small>Une nouvelle adresse doit être confirmée par e-mail avant de devenir active.</small></label>
          <button className="button" type="submit" disabled={savingProfile || savingPassword || savingPhone || Boolean(linking)}><Save size={15}/>{savingProfile ? 'Enregistrement…' : 'Enregistrer le profil'}</button>
        </form>
        <form className="account-panel account-form" onSubmit={savePassword}>
          <div className="account-panel-heading"><span className="account-panel-icon"><KeyRound size={18}/></span><div><h2>Sécurité</h2><p>Définissez un mot de passe EduVerse, même si vous utilisez Google ou GitHub.</p></div></div>
          <label htmlFor="account-password">Nouveau mot de passe<input id="account-password" name="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} placeholder="8 caractères minimum"/></label>
          <label htmlFor="account-password-confirm">Confirmer le mot de passe<input id="account-password-confirm" name="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="Répétez le nouveau mot de passe"/></label>
          <button className="button button-outline" type="submit" disabled={savingPassword || savingProfile || savingPhone || Boolean(linking)}><KeyRound size={15}/>{savingPassword ? 'Modification…' : 'Modifier le mot de passe'}</button>
          <div className="account-security-note"><Mail size={15}/><span>Ce mot de passe permet aussi une connexion e-mail lorsqu’une adresse vérifiée est liée à votre compte.</span></div>
        </form>
        <section className="account-panel account-form" aria-labelledby="account-phone-heading">
          <div className="account-panel-heading"><span className="account-panel-icon"><Mail size={18}/></span><div><h2 id="account-phone-heading">Téléphone</h2><p>Ajoutez ou remplacez votre numéro après vérification par SMS.</p></div></div>
          <form className="account-phone-form" onSubmit={pendingPhone ? confirmPhoneChange : requestPhoneChange}>
            {!pendingPhone ? <label htmlFor="account-phone">Numéro international<input id="account-phone" name="tel" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} placeholder="+212 6 00 00 00 00" maxLength={24} required/><small>Utilisez l’indicatif du pays, par exemple +212 pour le Maroc.</small></label> : <><label htmlFor="account-phone-pending">Nouveau numéro<input id="account-phone-pending" value={pendingPhone} readOnly/></label><label htmlFor="account-phone-code">Code reçu par SMS<input id="account-phone-code" name="one-time-code" inputMode="numeric" autoComplete="one-time-code" value={phoneCode} onChange={event => setPhoneCode(event.target.value)} maxLength={8} required placeholder="Code de confirmation"/></label></>}
            <button className="button button-outline" type="submit" disabled={savingPhone || savingProfile || savingPassword || Boolean(linking)}>{savingPhone ? 'Vérification…' : pendingPhone ? 'Confirmer le numéro' : 'Envoyer un code SMS'}</button>
          </form>
        </section>
        <section className="account-panel account-form" aria-labelledby="account-providers-heading">
          <div className="account-panel-heading"><span className="account-panel-icon"><Github size={18}/></span><div><h2 id="account-providers-heading">Connexion avec Google et GitHub</h2><p>Reliez les deux moyens à ce même compte EduVerse.</p></div></div>
          <div className="account-provider-list">
            {oauthProviders.map(provider => {
              const connected = identities.includes(provider.id)
              return <div className="account-provider-row" key={provider.id}><div><strong>{provider.label}</strong><small>{connected ? 'Relié à ce compte' : 'Pas encore relié'}</small></div>{connected ? <span className="account-provider-linked"><Check size={13}/> Relié</span> : <button className="button button-outline" type="button" onClick={() => void linkProvider(provider.id)} disabled={Boolean(linking) || savingProfile || savingPassword || savingPhone}>{linking === provider.id ? 'Redirection…' : `Relier ${provider.label}`}</button>}</div>
            })}
          </div>
          <div className="account-security-note"><KeyRound size={15}/><span>Google/GitHub doivent être activés dans Supabase. Lier un fournisseur différent peut demander d’activer « Allow manual linking » dans Authentication → Settings.</span></div>
        </section>
      </div>
    </>}
    {error && <div className="account-message account-error" role="alert">{error}</div>}
    {notice && <div className="account-message account-success" role="status">{notice}</div>}
  </div>
}
