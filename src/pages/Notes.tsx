import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useNotes, Note } from '@/hooks/useNotes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pin, Trash2, Edit, StickyNote } from 'lucide-react';

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Notes() {
  const { notes, isLoading, addNote, updateNote, deleteNote } = useNotes();
  const [isOpen, setIsOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    if (editingNote) {
      updateNote.mutate({ id: editingNote.id, title, content, color });
    } else {
      addNote.mutate({ title, content, color, is_pinned: false });
    }
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setColor(COLORS[0]);
    setEditingNote(null);
    setIsOpen(false);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setColor(note.color);
    setIsOpen(true);
  };

  const togglePin = (note: Note) => {
    updateNote.mutate({ id: note.id, is_pinned: !note.is_pinned });
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <StickyNote className="h-7 w-7 text-primary" />
              Notes
            </h1>
            <p className="text-muted-foreground mt-1">Capture your thoughts and ideas</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingNote ? 'Edit Note' : 'New Note'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Color</p>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setColor(c)}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  {editingNote ? 'Update' : 'Create'} Note
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : notes.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <StickyNote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notes yet. Create your first note!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <Card
                key={note.id}
                className="glass overflow-hidden group hover:shadow-lg transition-all"
                style={{ borderTopColor: note.color, borderTopWidth: '4px' }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => togglePin(note)}
                      >
                        <Pin className={`h-4 w-4 ${note.is_pinned ? 'fill-primary text-primary' : ''}`} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => openEdit(note)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => deleteNote.mutate(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                    {note.content || 'No content'}
                  </p>
                  {note.is_pinned && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-primary">
                      <Pin className="h-3 w-3 fill-current" /> Pinned
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
