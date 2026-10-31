import { useState } from 'react';
import { ChevronDown, ScanSearch, Wrench } from 'lucide-react';
import type { IncidentDetail } from '../../api';
import { useAnalyzeIncident, useFixIncident } from '../../hooks';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { errorMessage, useFeedback } from '../ui/feedback';
import { Field, Textarea } from '../ui/input';

/** "Generate fix" (with optional instructions) and, optionally, "Run analysis". */
export function FixActions({ incident, size = 'sm', showAnalyze = false }: {
  incident: IncidentDetail; size?: 'sm' | 'md'; showAnalyze?: boolean;
}) {
  const fix = useFixIncident(incident.id);
  const analyze = useAnalyzeIncident(incident.id);
  const { toast } = useFeedback();
  const [withNotes, setWithNotes] = useState(false);
  const [instructions, setInstructions] = useState('');
  const busy = incident.status === 'fixing' || incident.status === 'analyzing';

  // mutateAsync so the toast still shows if this row leaves the inbox meanwhile.
  const runFix = async (notes?: string) => {
    try {
      await fix.mutateAsync(notes);
      setWithNotes(false);
      setInstructions('');
      toast('Fix queued. Progress shows on the incident.');
    } catch (e) {
      toast(errorMessage(e, 'Could not start the fix'), 'error');
    }
  };

  const runAnalysis = async () => {
    try {
      await analyze.mutateAsync();
      toast('Analysis queued.');
    } catch (e) {
      toast(errorMessage(e, 'Could not start the analysis'), 'error');
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {showAnalyze && (
          <Button size={size} onClick={runAnalysis} loading={analyze.isPending} disabled={busy}>
            {!analyze.isPending && <ScanSearch className="w-3.5 h-3.5" />} Run analysis
          </Button>
        )}
        <div className="flex">
          <Button variant="primary" size={size} className="rounded-r-none" onClick={() => runFix()} loading={fix.isPending} disabled={busy}>
            {!fix.isPending && <Wrench className="w-3.5 h-3.5" />} {incident.fix_job_id ? 'Try a new fix' : 'Generate fix'}
          </Button>
          <Button variant="primary" size={size} className="rounded-l-none border-l border-on-acid/20 px-1.5"
            onClick={() => setWithNotes(true)} disabled={busy || fix.isPending} aria-label="Generate fix with instructions">
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      <Dialog
        open={withNotes}
        onClose={() => setWithNotes(false)}
        title="Generate a fix"
        description={incident.title}
        footer={
          <>
            <Button variant="ghost" onClick={() => setWithNotes(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => runFix(instructions.trim() || undefined)} loading={fix.isPending}>
              <Wrench className="w-3.5 h-3.5" /> Start fix
            </Button>
          </>
        }
      >
        <Field label="Instructions for the agent (optional)" htmlFor={`fix-notes-${incident.id}`}
          hint="Point it at the right code or rule something out. Leave empty to let it investigate.">
          <Textarea id={`fix-notes-${incident.id}`} value={instructions} onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. The bug is in pricing.apply_discount; don't touch the API layer." />
        </Field>
      </Dialog>
    </>
  );
}
