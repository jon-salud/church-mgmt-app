'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { clientApi } from '@/lib/api.client';
import { PastoralCareTicket, PastoralCareComment } from '@/lib/types';

export function TicketDetailClientPage({ ticket: initialTicket }: { ticket: PastoralCareTicket }) {
  const [ticket, setTicket] = useState(initialTicket);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = async () => {
    const comment = await clientApi.createPastoralCareComment(ticket.id, { body: newComment });
    setTicket((prevTicket) => ({
      ...prevTicket,
      comments: [...prevTicket.comments, comment],
    }));
    setNewComment('');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{ticket.title}</h1>
      <p>{ticket.description}</p>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Comments</h2>
        {ticket.comments.map((comment: PastoralCareComment) => (
          <div key={comment.id} className="p-4 border rounded-lg">
            <p className="font-semibold">{comment.author.profile.firstName} {comment.author.profile.lastName}</p>
            <p>{comment.body}</p>
            <p className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Add a Comment</h2>
        <Textarea id="new-comment-textarea" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
        <Button id="add-comment-button" onClick={handleAddComment}>
          Add Comment
        </Button>
      </div>
    </div>
  );
}
