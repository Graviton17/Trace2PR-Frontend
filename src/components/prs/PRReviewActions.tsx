import { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { PRDetail } from '../../api';
import { useApprovePR, useRejectPR } from '../../hooks';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { errorMessage, useFeedback } from '../ui/feedback';
import { Field, Textarea } from '../ui/input';

/** Approve / reject a draft PR. Approving marks it ready for review on GitHub;
 * rejecting closes it with the reason as a comment and reopens the incident. */
export function PRReviewActions({ pr, size = 'sm' }: { pr: PRDetail; size?: 'sm' | 'md' }) {
  const approve = useApprovePR();
  const reject = useRejectPR();
  const { toast } = useFeedback();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  if (pr.status !== 'draft') return null;

  // mutateAsync, not per-call callbacks: in the inbox this row unmounts as soon
  // as the PR leaves "draft", and React Query drops callbacks of unmounted callers.
  const onApprove = async () => {
    try {
      await approve.mutateAsync(pr.id);
      toast('Approved. The PR is ready for review on GitHub.');
    } catch (e) {
      toast(errorMessage(e, 'Could not approve the PR'), 'error');
    }
  };

  const onReject = async () => {
    try {
      await reject.mutateAsync({ id: pr.id, reason: reason.trim() });
      setRejecting(false);
      setReason('');
      toast('PR closed. Your reason was posted and saved as feedback.');
    } catch (e) {
      toast(errorMessage(e, 'Could not reject the PR'), 'error');
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="primary" size={size} onClick={onApprove} loading={approve.isPending} disabled={reject.isPending}>
          {!approve.isPending && <Check className="w-3.5 h-3.5" />} Approve
        </Button>
        <Button variant="ghost" size={size} onClick={() => setRejecting(true)} disabled={approve.isPending}>
          <X className="w-3.5 h-3.5" /> Reject
        </Button>
      </div>
      <Dialog
        open={rejecting}
        onClose={() => setRejecting(false)}
        title="Reject this fix"
        description="The pull request is closed on GitHub and the incident reopens."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejecting(false)}>Cancel</Button>
            <Button variant="danger" onClick={onReject} loading={reject.isPending} disabled={reason.trim().length < 3}>
              Close PR
            </Button>
          </>
        }
      >
        <Field label="What's wrong with the fix?" htmlFor={`reject-${pr.id}`}
          hint="Posted as a comment on the PR and kept as feedback for future fixes.">
          <Textarea id={`reject-${pr.id}`} value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Fixes the symptom; the null comes from the cart loader." />
        </Field>
      </Dialog>
    </>
  );
}
