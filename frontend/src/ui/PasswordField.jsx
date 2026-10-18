import React, { useId, useState } from 'react';
import { Check, Circle, Eye, EyeOff } from 'lucide-react';

export default function PasswordField({ label = 'Mot de passe', name = 'password' }) {
  const id = useId();
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);
  const rules = [
    ['8 caractères minimum', [...value].length >= 8],
    ['Une majuscule', /\p{Lu}/u.test(value)],
    ['Une minuscule', /\p{Ll}/u.test(value)],
    ['Un chiffre', /[0-9]/.test(value)],
    ['Un caractère spécial (ex. ! ? @)', /[^\p{L}\p{N}\s]/u.test(value)],
    ['72 octets maximum', new TextEncoder().encode(value).length <= 72],
  ];
  return <div className="password-field">
    <label htmlFor={id}>{label}</label>
    <div className="password-control">
      <input id={id} name={name} type={visible ? 'text' : 'password'} required autoComplete="new-password" value={value} aria-describedby={`${id}-rules`}
        onChange={event => { const next = event.target.value; setValue(next); event.target.setCustomValidity([...next].length >= 8 && /\p{Lu}/u.test(next) && /\p{Ll}/u.test(next) && /[0-9]/.test(next) && /[^\p{L}\p{N}\s]/u.test(next) && new TextEncoder().encode(next).length <= 72 ? '' : 'Respectez les critères du mot de passe ci-dessous.'); }} />
      <button type="button" className="button ghost" aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}</button>
    </div>
    <ul id={`${id}-rules`} className="password-rules">{rules.map(([text, passed]) => <li key={text} data-passed={value && passed ? 'true' : 'false'}>{value && passed ? <Check size={15} aria-hidden="true" /> : <Circle size={15} aria-hidden="true" />}<span>{text}<span className="sr-only"> : {value && passed ? 'respecté' : 'à vérifier'}</span></span></li>)}</ul>
  </div>;
}
