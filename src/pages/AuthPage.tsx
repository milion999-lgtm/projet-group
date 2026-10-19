import { lazy, Suspense, useMemo, useState, type FormEvent } from 'react'
import { ArrowDown, ArrowRight, Eye, EyeOff, Github, GraduationCap, Search } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../App'
import { supabase } from '../lib/supabase'
import { countryFlag, countryFlagUrl, countryName, normalizeNationalNumber, phoneCountries } from '../phoneCountries'

const AuthGlobe = lazy(() => import('../components/AuthGlobe'))

function GoogleMark() {
  return <svg aria-hidden="true" viewBox="0 0 48 48" width="18" height="18"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.8-3.5 6.1-8.7 6.1-15Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2A20 20 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12.6 27.5a12 12 0 0 1 0-7v-5.2H5.8a20 20 0 0 0 0 17.4l6.8-5.2Z"/><path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.8 15.3l6.8 5.2C14.2 15.6 18.7 12 24 12Z"/></svg>
}

export default function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const [signup, setSignup] = useState(mode === 'signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneCountry, setPhoneCountry] = useState('MA')
  const [countryPickerOpen, setCountryPickerOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [verificationPhone, setVerificationPhone] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [phoneCodeSent, setPhoneCodeSent] = useState(false)
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const { signIn, signInOAuth, authConfigured } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const next = new URLSearchParams(location.search).get('next')
  const destination = next?.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
  const selectedPhoneCountry = phoneCountries.find(country => country.region === phoneCountry) ?? phoneCountries[0]
  const filteredPhoneCountries = useMemo(() => {
    const query = countrySearch.trim().toLocaleLowerCase('fr')
    if (!query) return phoneCountries
    return phoneCountries.filter(country =>
      countryName(country.region).toLocaleLowerCase('fr').includes(query) ||
      country.region.toLowerCase().includes(query) ||
      country.callingCode.includes(query.replace(/^\+/, ''))
    )
  }, [countrySearch])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    try {
      const result = await signIn(email, password, name, signup ? 'signup' : 'login')
      if (result.error) { setError(result.error); return }
      if (result.confirmationRequired) {
        setNotice('Le compte a été créé. Consultez votre boîte e-mail et confirmez votre adresse avant de vous connecter.')
        setSignup(false)
        setPassword('')
        return
      }
      navigate(destination)
    } catch {
      setError('Le service de compte est momentanément indisponible. Vérifiez votre connexion et réessayez.')
    } finally {
      setBusy(false)
    }
  }

  async function useProvider(provider: 'google' | 'github') {
    setError('')
    setNotice('')
    setBusy(true)
    try {
      const message = await signInOAuth(provider)
      if (message) { setError(message); setBusy(false) }
    } catch {
      setError('La connexion avec ce fournisseur est momentanément indisponible.')
      setBusy(false)
    }
  }

  async function submitPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!supabase) { setError('Le service de compte n’est pas configuré.'); return }

    const selectedCountry = phoneCountries.find(country => country.region === phoneCountry)
    const normalizedPhone = selectedCountry ? normalizeNationalNumber(phone, selectedCountry.region, selectedCountry.callingCode) : ''
    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
      setError('Entrez un numéro valide pour le pays sélectionné, sans l’indicatif pays.')
      return
    }

    setBusy(true)
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
        options: { shouldCreateUser: signup, data: signup ? { display_name: name.trim() } : undefined },
      })
      if (otpError) {
        const message = otpError.message.toLowerCase()
        setError(message.includes('sms') || message.includes('phone')
          ? 'La connexion par téléphone n’est pas encore prête. Un service SMS doit être configuré dans Supabase.'
          : 'Impossible d’envoyer le code. Vérifiez le numéro et réessayez.')
        return
      }
      setVerificationPhone(normalizedPhone)
      setPhoneCodeSent(true)
      setNotice(`Un code de vérification a été envoyé au ${normalizedPhone}.`)
    } catch {
      setError('Le service SMS est momentanément indisponible. Réessayez plus tard.')
    } finally {
      setBusy(false)
    }
  }

  async function resendPhoneCode() {
    setError('')
    setNotice('')
    if (!supabase) { setError('Le service de compte n’est pas configuré.'); return }
    setBusy(true)
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({ phone: verificationPhone, options: { shouldCreateUser: signup } })
      if (otpError) {
        setError('Impossible de renvoyer le code. Vérifiez la configuration SMS et réessayez.')
        return
      }
      setNotice(`Un nouveau code a été envoyé au ${verificationPhone}.`)
    } catch {
      setError('Le service SMS est momentanément indisponible. Réessayez plus tard.')
    } finally {
      setBusy(false)
    }
  }

  async function verifyPhoneCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!supabase) { setError('Le service de compte n’est pas configuré.'); return }
    setBusy(true)
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({ phone: verificationPhone, token: phoneCode.trim(), type: 'sms' })
      if (verifyError) { setError('Le code est incorrect ou expiré. Vérifiez-le et réessayez.'); return }
      navigate(destination)
    } catch {
      setError('La vérification est momentanément indisponible. Réessayez.')
    } finally {
      setBusy(false)
    }
  }

  const handlePhoneSubmit = (event: FormEvent<HTMLFormElement>) => phoneCodeSent ? void verifyPhoneCode(event) : void submitPhone(event)

  return <div className="auth-page">
    <div className="auth-art">
      <div className="auth-ring ring-a"/><div className="auth-ring ring-b"/>
      <div className="auth-globe-stage"><Suspense fallback={<div className="auth-globe-loading" role="status" aria-label="Chargement du globe 3D"/>}><AuthGlobe/></Suspense></div>
      <div className="auth-art-copy"><span className="eyebrow">VOTRE ESPACE D’APPRENTISSAGE</span><h2>Un pas après<br/>l’autre.</h2><p>Parcourez le catalogue librement. Créez un compte quand vous voudrez commencer une formation.</p><Link to="/" className="button button-outline auth-explore-link">Explorer le site sans compte <ArrowRight size={15}/></Link></div>
    </div>
    <div className="auth-form-side"><div className="auth-form-wrap">
      <Link className="auth-brand brand" to="/"><span className="brand-symbol"><span/></span><span>eduverse<span className="brand-dot">.</span></span></Link>
      <span className="eyebrow">{signup ? 'CRÉER UN ESPACE PERSONNEL' : 'CONNEXION SÉCURISÉE'}</span>
      <h1>{signup ? 'Créer un compte' : 'Ravi de vous revoir'}</h1>
      <p className="auth-subtitle">{signup ? 'Inscrivez-vous avec votre e-mail, Google, GitHub ou téléphone pour démarrer une formation et suivre votre progression.' : 'Connectez-vous à votre compte par e-mail, Google, GitHub ou téléphone.'}</p>
      {!authConfigured && <div className="auth-config-note" role="status"><strong>Configuration nécessaire</strong><span>Le site doit être relié à Supabase avant de pouvoir créer ou vérifier des comptes. Ajoutez l’URL et la clé publique Supabase dans .env.local, puis redémarrez le site.</span></div>}
      <div className="oauth-buttons"><button type="button" className="oauth-button" disabled={!authConfigured || busy} onClick={() => void useProvider('google')}><GoogleMark/> Continuer avec Google</button><button type="button" className="oauth-button" disabled={!authConfigured || busy} onClick={() => void useProvider('github')}><Github size={18}/> Continuer avec GitHub</button></div>
      <div className="auth-method-switch" role="group" aria-label="Choisir une méthode de connexion"><button type="button" className={authMethod==='email'?'method-active':''} aria-pressed={authMethod==='email'} onClick={()=>{setAuthMethod('email');setError('');setNotice('')}}>E-mail</button><button type="button" className={authMethod==='phone'?'method-active':''} aria-pressed={authMethod==='phone'} onClick={()=>{setAuthMethod('phone');setError('');setNotice('')}}>Téléphone</button></div>
      <div className="auth-separator"><span>{authMethod==='email'?'ou par e-mail':'ou par téléphone'}</span></div>
      {authMethod==='email' ? <form onSubmit={submit} className="auth-form">
        {signup&&<label>Nom<input required maxLength={80} value={name} onChange={e=>setName(e.target.value)} placeholder="Votre nom" autoComplete="name"/></label>}
        <label>Adresse e-mail<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@exemple.fr" autoComplete="email"/></label>
        <label>Mot de passe<div className="password-wrap"><input required minLength={6} type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="6 caractères minimum" autoComplete={signup?'new-password':'current-password'}/><button type="button" onClick={()=>setShow(!show)} aria-label={show?'Masquer le mot de passe':'Afficher le mot de passe'}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
        <button className="button button-full" type="submit" disabled={!authConfigured || busy}>{busy ? 'Connexion…' : signup ? 'Créer un compte' : 'Se connecter'} <ArrowRight size={15}/></button>
      </form> : <form onSubmit={handlePhoneSubmit} className="auth-form">
        {signup&&<label>Nom<input required maxLength={80} value={name} onChange={e=>setName(e.target.value)} placeholder="Votre nom" autoComplete="name"/></label>}
        <div className="phone-country-field">
          <span className="phone-country-label" id="auth-phone-country-label">Pays</span>
          <div className="phone-country-picker">
            <button type="button" id="auth-phone-country" className="phone-country-trigger" aria-labelledby="auth-phone-country-label" aria-haspopup="listbox" aria-expanded={countryPickerOpen} disabled={phoneCodeSent} onClick={() => { setCountryPickerOpen(open => !open); setCountrySearch('') }}>
              <span className="phone-flag-wrap"><span aria-hidden="true">{countryFlag(selectedPhoneCountry.region)}</span><img src={countryFlagUrl(selectedPhoneCountry.region)} alt="" onError={event => { event.currentTarget.style.display = 'none' }}/></span>
              <span className="phone-country-current">{countryName(selectedPhoneCountry.region)}</span>
              <span className="phone-country-code">+{selectedPhoneCountry.callingCode}</span><ArrowDown size={14} aria-hidden="true"/>
            </button>
            {countryPickerOpen && !phoneCodeSent && <div className="phone-country-menu">
              <label className="phone-country-search"><Search size={15} aria-hidden="true"/><input autoFocus type="search" value={countrySearch} onChange={event => setCountrySearch(event.target.value)} placeholder="Rechercher un pays ou un indicatif" aria-label="Rechercher un pays ou un indicatif"/></label>
              <div className="phone-country-options" role="listbox" aria-label="Pays disponibles">
                {filteredPhoneCountries.map(country => <button type="button" role="option" aria-selected={country.region === phoneCountry} key={country.region} className="phone-country-option" onClick={() => { setPhoneCountry(country.region); setCountryPickerOpen(false); setCountrySearch('') }}>
                  <span className="phone-flag-wrap"><span aria-hidden="true">{countryFlag(country.region)}</span><img loading="lazy" src={countryFlagUrl(country.region)} alt="" onError={event => { event.currentTarget.style.display = 'none' }}/></span>
                  <span className="phone-country-option-name">{countryName(country.region)}</span><span className="phone-country-code">+{country.callingCode}</span>
                </button>)}
                {filteredPhoneCountries.length === 0 && <p className="phone-country-empty">Aucun pays trouvé.</p>}
              </div>
            </div>}
          </div>
        </div>
        <label htmlFor="auth-phone">Numéro de téléphone</label>
        <div className="phone-input-row">
          <span className="phone-selected-prefix"><span className="phone-flag-wrap phone-flag-small"><span aria-hidden="true">{countryFlag(selectedPhoneCountry.region)}</span><img src={countryFlagUrl(selectedPhoneCountry.region)} alt="" onError={event => { event.currentTarget.style.display = 'none' }}/></span> +{selectedPhoneCountry.callingCode}</span>
          <input id="auth-phone" required type="tel" inputMode="tel" autoComplete="tel-national" maxLength={24} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="6 12 34 56 78" disabled={phoneCodeSent}/>
        </div>
        <p className="phone-auth-help">Choisissez le pays puis entrez le numéro national. La disponibilité des SMS dépend du fournisseur choisi.</p>
        {phoneCodeSent&&<label htmlFor="auth-phone-code">Code reçu par SMS<input id="auth-phone-code" required inputMode="numeric" autoComplete="one-time-code" maxLength={12} value={phoneCode} onChange={e=>setPhoneCode(e.target.value)} placeholder="Code de vérification"/></label>}
        <button className="button button-full" type="submit" disabled={!authConfigured || busy}>{busy?'Vérification…':phoneCodeSent?'Vérifier le code':'Envoyer le code'} <ArrowRight size={15}/></button>
        {phoneCodeSent&&<div className="phone-auth-actions"><button type="button" disabled={busy} onClick={()=>void resendPhoneCode()}>Renvoyer le code</button><button type="button" disabled={busy} onClick={()=>{setPhoneCodeSent(false);setPhoneCode('');setVerificationPhone('');setNotice('');setError('')}}>Modifier le numéro</button></div>}
      </form>}
      {error&&<div className="form-error" role="alert">{error}</div>}{notice&&<div className="auth-success" role="status">{notice}</div>}
      <div className="auth-switch">{signup?'Vous avez déjà un compte ?':'Nouveau sur EduVerse ?'} <button type="button" disabled={busy} onClick={()=>{setSignup(!signup);setError('');setNotice('');setPhoneCodeSent(false);setPhoneCode('');setVerificationPhone('')}}>{signup?'Se connecter':'Créer un compte'}</button></div>
      <p className="demo-auth-note"><GraduationCap size={14}/> Votre compte sera géré par Supabase. Le diagnostic de compétences apparaît après connexion.</p>
    </div></div>
  </div>
}
