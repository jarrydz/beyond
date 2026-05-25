import { useMemo, useState, type KeyboardEvent } from 'react';
import { Avatar, Button, Card, useToast } from '@/components';
import { useData } from '@/services';
import { useStoreState } from '@/store/StoreProvider';
import { relativeTime } from '@/utils/format';
import type { Post, Profile } from '@/types';

export function GroupScreen() {
  const data = useData();
  const toast = useToast();

  const me = useStoreState((s) => s.profiles.find((p) => p.id === s.currentUserId)!);
  const profiles = useStoreState((s) => s.profiles);
  const posts = useStoreState((s) => s.posts);
  const cohort = useStoreState((s) => s.cohort);
  const memberCount = useStoreState(
    (s) => s.profiles.filter((p) => p.role === 'member' && p.cohortId === s.cohort.id).length,
  );

  const feed = useMemo(
    () =>
      [...posts]
        .filter((p) => p.cohortId === cohort.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [posts, cohort.id],
  );

  const profileById = useMemo(() => {
    const m = new Map<string, Profile>();
    for (const p of profiles) m.set(p.id, p);
    return m;
  }, [profiles]);

  const [draft, setDraft] = useState('');

  function submit() {
    const body = draft.trim();
    if (!body) return;
    data.addPost(body);
    setDraft('');
    toast('Shared with your group');
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  }

  return (
    <section className="px-5 pt-3 pb-7">
      <h2 className="font-serif font-semibold text-[25px] mt-1.5 mb-0.5">Your group</h2>
      <p className="text-muted text-[13.5px] mb-4">
        {cohort.retreatName} · {cohort.name} · {memberCount} members
      </p>

      <Card tone="sage">
        <div className="flex gap-2.5 items-center">
          <span className="inline-flex items-center bg-sand text-green text-[12px] font-semibold rounded-full px-3 py-1">
            Next meet-up
          </span>
          <div className="text-[13px] font-semibold">Bondi coastal walk · Sat 7am</div>
        </div>
        <Button
          variant="ghost"
          className="mt-3"
          onClick={() => toast("You're in for Saturday. See you there.")}
        >
          Count me in
        </Button>
      </Card>

      <div className="flex gap-2.5 items-center mb-3.5">
        <Avatar profile={me} />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder="Share a win or a struggle…"
          className="flex-1 border border-line bg-white rounded-[14px] px-3.5 py-3 text-[13.5px] outline-none focus:border-sage"
        />
        <button
          type="button"
          onClick={submit}
          aria-label="Post"
          disabled={!draft.trim()}
          className="flex-none w-11 h-11 rounded-[13px] bg-green grid place-items-center disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#F4EFE7">
            <path d="M3 11l18-8-8 18-2-7-8-3z" />
          </svg>
        </button>
      </div>

      {feed.map((post) => {
        const author = profileById.get(post.authorId);
        if (!author) return null;
        return <PostCard key={post.id} post={post} author={author} meId={me.id} onLike={() => data.toggleLike(post.id)} />;
      })}
    </section>
  );
}

function PostCard({
  post,
  author,
  meId,
  onLike,
}: {
  post: Post;
  author: Profile;
  meId: string;
  onLike: () => void;
}) {
  const liked = post.likedBy.includes(meId);
  const isLeader = author.role === 'coach';
  const isYou = author.id === meId;
  const toast = useToast();

  return (
    <Card>
      <div className="flex gap-3">
        <Avatar profile={author} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">
            {isYou ? 'You' : displayName(author)}
            {isLeader && !isYou && (
              <span className="text-muted text-[12px] font-medium"> · your leader</span>
            )}
            <span className="text-muted text-[11.5px] font-medium ml-1">
              · {relativeTime(post.createdAt)}
            </span>
          </div>
          <div className="text-[13.5px] leading-relaxed mt-1 mb-2 text-[#3a382f]">{post.body}</div>
          <div className="flex gap-4 items-center text-[12.5px] font-semibold text-muted">
            <button
              type="button"
              onClick={onLike}
              className={[
                'flex items-center gap-1.5 transition-colors',
                liked ? 'text-terra' : 'text-muted',
              ].join(' ')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M12 21c5-4 8-7 8-11a4 4 0 0 0-8-1 4 4 0 0 0-8 1c0 4 3 7 8 11Z" />
              </svg>
              <span>{post.likedBy.length}</span>
            </button>
            <button
              type="button"
              onClick={() => toast('Comments coming in the build')}
              className="flex items-center gap-1.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a8 8 0 0 1-11 7l-5 2 2-5a8 8 0 1 1 14-4Z" />
              </svg>
              <span>0</span>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function displayName(p: Profile): string {
  const parts = p.fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0]}.`;
}
