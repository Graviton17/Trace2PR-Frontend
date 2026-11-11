import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { integrationsApi } from '../../api';
import type { Integration, IntegrationCatalogItem } from '../../api';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { errorMessage } from '../ui/feedback';
import { Field, Input } from '../ui/input';

/** Credentials form for tools Composio can't connect (e.g. CloudWatch). The
 *  backend checks them against the tool before storing them in Vault. */
export function CredentialsDialog({ item, open, onClose, onSaved, reconnect }: {
  item: IntegrationCatalogItem;
  open: boolean;
  onClose: () => void;
  onSaved: (integration: Integration) => void;
  /** Replacing stored credentials: secrets are never sent back, so they're re-entered. */
  reconnect?: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const missing = item.credential_fields.some((f) => f.required && !values[f.name]?.trim());
  const formId = `credentials-${item.id}`;

  const close = () => {
    if (saving) return;
    setValues({});
    setError(null);
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const integration = await integrationsApi.saveCredentials(item.id, values, item.category);
      setValues({});
      onSaved(integration);
    } catch (err) {
      setError(errorMessage(err, 'Could not save the credentials'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title={`${reconnect ? 'Update' : 'Connect'} ${item.name}`}
      description={<span className="flex items-start gap-1.5"><Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" /> Checked with {item.name} first, then stored encrypted in Supabase Vault. Secrets are never shown again.</span>}
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={saving}>Cancel</Button>
          <Button type="submit" form={formId} variant="primary" loading={saving} disabled={missing}>
            {saving ? 'Checking…' : reconnect ? 'Save' : 'Connect'}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} className="space-y-4" autoComplete="off">
        {item.credential_fields.map((f, index) => {
          const id = `${formId}-${f.name}`;
          return (
            <Field key={f.name} label={f.required ? f.label : `${f.label} (optional)`} htmlFor={id} hint={f.help}>
              <div className="relative">
                <Input
                  id={id}
                  mono
                  autoFocus={index === 0}
                  type={f.secret && !shown[f.name] ? 'password' : 'text'}
                  // Stops browsers offering saved passwords for API secrets.
                  autoComplete={f.secret ? 'new-password' : 'off'}
                  spellCheck={false}
                  placeholder={f.placeholder ?? undefined}
                  value={values[f.name] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                  className={f.secret ? 'pr-9' : undefined}
                />
                {f.secret && (
                  <button type="button" onClick={() => setShown((s) => ({ ...s, [f.name]: !s[f.name] }))}
                    aria-label={shown[f.name] ? `Hide ${f.label}` : `Show ${f.label}`}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1">
                    {shown[f.name] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </Field>
          );
        })}
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
      </form>
    </Dialog>
  );
}
