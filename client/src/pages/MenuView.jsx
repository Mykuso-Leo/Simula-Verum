import { useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { useNotify } from '../notifications/NotificationContext.jsx'
import { pinPost, unpinPost } from '../api/posts.js'
import { PostList } from './PostList.jsx'
import { PostDetail } from './PostDetail.jsx'
import { CreatePostButton } from '../admin/CreatePostButton.jsx'
import { EditPostsButton } from '../admin/EditPostsButton.jsx'

export function MenuView() {
  const { user } = useAuth()
  const notify = useNotify()
  const [selectedId, setSelectedId] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = () => setRefreshKey((k) => k + 1)

  const handleTogglePin = async (post) => {
    try {
      if (post.pinned) {
        await unpinPost(post.id)
      } else {
        await pinPost(post.id)
      }
      refresh()
    } catch (err) {
      notify(err.message)
    }
  }

  return (
    <div className="menu-view">
      {selectedId ? (
        <PostDetail postId={selectedId} onBack={() => setSelectedId(null)} />
      ) : (
        <PostList key={refreshKey} onSelect={setSelectedId} isAdmin={user.isAdmin} onTogglePin={handleTogglePin} />
      )}

      {user.isAdmin && !selectedId && (
        <>
          <CreatePostButton onCreated={refresh} />
          <EditPostsButton onChanged={refresh} />
        </>
      )}
    </div>
  )
}
