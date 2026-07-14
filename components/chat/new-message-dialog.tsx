"use client";

import { MessageSquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { sendChatMessageAction } from "@/app/actions/chat";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type ChatContactOption = {
  id: string;
  fullName: string;
  subtitle?: string;
};

export function NewMessageDialog({
  contacts,
  redirectBase,
  triggerLabel = "New message",
}: {
  contacts: ChatContactOption[];
  redirectBase: string;
  triggerLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (contacts.length === 0) return null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientId || !body.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await sendChatMessageAction({
        recipientId,
        body,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setOpen(false);
      setBody("");
      setRecipientId("");
      router.push(`${redirectBase}?thread=${result.threadId}`);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" className="gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>New message</DialogTitle>
            <DialogDescription>
              Choose someone to message and write your first note.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="chat-recipient">To</Label>
            <Select value={recipientId} onValueChange={setRecipientId}>
              <SelectTrigger id="chat-recipient" className="w-full">
                <SelectValue placeholder="Select a contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.fullName}
                    {c.subtitle ? ` · ${c.subtitle}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chat-body">Message</Label>
            <Textarea
              id="chat-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message…"
              rows={4}
              maxLength={4000}
              required
            />
          </div>

          {error ? <p className="text-xs text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending || !recipientId || !body.trim()}
            >
              {pending ? "Sending…" : "Send"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
