import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { lessonsAPI } from '../api';

interface Lesson {
  id: string; title: string; content: string; duration: string; type: string;
  categoryId: string; categoryName: string; videoUrl?: string;
  savollar?: string; xulosa?: string;
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
}

export function DarsSahifasi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [bufferStatus, setBufferStatus] = useState<string>('');

  useEffect(() => { loadLesson(); window.scrollTo(0, 0); }, [id]);

  // Check bookmark status
  useEffect(() => {
    if (id) {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarkedLessons') || '[]');
      setIsBookmarked(bookmarks.includes(id));
    }
  }, [id]);

  // Toggle bookmark
  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedLessons') || '[]');
    if (isBookmarked) {
      const newBookmarks = bookmarks.filter((b: string) => b !== id);
      localStorage.setItem('bookmarkedLessons', JSON.stringify(newBookmarks));
      setIsBookmarked(false);
    } else {
      bookmarks.push(id);
      localStorage.setItem('bookmarkedLessons', JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  // Share lesson
  const handleShare = async () => {
    const shareData = {
      title: lesson?.title || 'Dars',
      text: `${lesson?.title} - Mukammal Ota Ona platformasida`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  // Get video URL - no token needed for public access
  const getVideoUrl = (videoUrl: string) => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return `http://localhost:3001${videoUrl}`;
    }
    // Production: Nginx /api orqali backend'ga yo'naltiradi
    const apiPath = videoUrl.startsWith('/api') ? videoUrl : `/api${videoUrl}`;
    return apiPath;
  };

  // Video buffering - 5 soniya oldindan yuklash
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const BUFFER_AHEAD = 5; // 5 soniya oldindan yuklash

    const checkBuffer = () => {
      if (!video.buffered.length) return;
      
      const currentTime = video.currentTime;
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const bufferAhead = bufferedEnd - currentTime;
      
      // Buffer holatini ko'rsatish (debug uchun)
      if (bufferAhead < BUFFER_AHEAD && !video.paused) {
        setBufferStatus(`Yuklanmoqda... ${Math.round(bufferAhead)}s`);
      } else {
        setBufferStatus('');
      }
    };

    const handleProgress = () => checkBuffer();
    const handleTimeUpdate = () => checkBuffer();
    
    // Video to'liq yuklanganda cache'ga saqlash
    const handleCanPlayThrough = () => {
      setBufferStatus('');
    };

    const handleWaiting = () => {
      setBufferStatus('Yuklanmoqda...');
    };

    const handlePlaying = () => {
      setBufferStatus('');
    };

    video.addEventListener('progress', handleProgress);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };
  }, [lesson?.id]);

  const loadLesson = async () => {
    setLoading(true);
    try {
      const res = await lessonsAPI.getOne(id!);
      setLesson(res.data);
    } catch (err: any) {
      navigate('/bolim');
    } finally { setLoading(false); }
  };

  const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
    article: { icon: 'article', label: 'Maqola', color: 'bg-emerald-100 text-emerald-600' },
    video: { icon: 'play_circle', label: 'Video', color: 'bg-emerald-100 text-emerald-600' },
    audio: { icon: 'headphones', label: 'Audio', color: 'bg-orange-100 text-orange-600' },
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>;

  if (!lesson) return null;
  const type = typeConfig[lesson.type] || typeConfig.article;
  const paragraphs = lesson.content?.split('\n\n').filter(p => p.trim()) || [];


  return (
    <div className="min-h-screen bg-slate-50 font-display">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 sm:h-16 lg:h-20 gap-3">
            <button onClick={() => navigate('/bolim')} className="p-2 hover:bg-slate-100 rounded-xl">
              <span className="material-symbols-outlined text-slate-600">arrow_back</span>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-slate-900 truncate">{lesson.title}</h1>
              <p className="text-xs sm:text-sm text-slate-500 truncate">{lesson.categoryName}</p>
            </div>
            <button 
              onClick={toggleBookmark} 
              className={`p-2 rounded-xl transition-all ${isBookmarked ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 text-slate-600'}`}
              title={isBookmarked ? 'Saqlanganlardan olib tashlash' : 'Saqlash'}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
            </button>
            <button 
              onClick={handleShare} 
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-all"
              title="Ulashish"
            >
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <article className="bg-white rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden border border-slate-100">
          {/* Video Player */}
          {lesson.type === 'video' && lesson.videoUrl && (
            <div className="relative bg-black aspect-video">
              <video 
                ref={videoRef}
                key={lesson.id}
                controls 
                className="w-full h-full" 
                controlsList="nodownload noplaybackrate" 
                disablePictureInPicture
                preload="auto"
                onContextMenu={(e) => e.preventDefault()}
                src={getVideoUrl(lesson.videoUrl)}
              >
                Brauzeringiz video formatini qo'llab-quvvatlamaydi.
              </video>
              {/* Buffer status indicator */}
              {bufferStatus && (
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 text-white text-xs rounded-lg flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {bufferStatus}
                </div>
              )}
            </div>
          )}

          {/* Accordion Sections */}
          {lesson.type === 'video' && (lesson.savollar || lesson.xulosa) && (
            <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-3">
              {/* Savollar */}
              {lesson.savollar && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenSection(openSection === 'savollar' ? null : 'savollar')}
                    className={`w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 transition-colors ${openSection === 'savollar' ? 'bg-emerald-50' : 'bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${openSection === 'savollar' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                        <span className="material-symbols-outlined text-lg sm:text-xl">help</span>
                      </div>
                      <span className="font-semibold text-slate-800 text-sm sm:text-base">Savollar</span>
                    </div>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform ${openSection === 'savollar' ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  {openSection === 'savollar' && (
                    <div className="px-4 sm:px-5 py-4 sm:py-5 bg-white border-t border-slate-100">
                      <p className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">{lesson.savollar}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Xulosa */}
              {lesson.xulosa && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenSection(openSection === 'xulosa' ? null : 'xulosa')}
                    className={`w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 transition-colors ${openSection === 'xulosa' ? 'bg-amber-50' : 'bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${openSection === 'xulosa' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600'}`}>
                        <span className="material-symbols-outlined text-lg sm:text-xl">lightbulb</span>
                      </div>
                      <span className="font-semibold text-slate-800 text-sm sm:text-base">Xulosa</span>
                    </div>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform ${openSection === 'xulosa' ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  {openSection === 'xulosa' && (
                    <div className="px-4 sm:px-5 py-4 sm:py-5 bg-white border-t border-slate-100">
                      <p className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">{lesson.xulosa}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Hero for non-video */}
          {lesson.type !== 'video' && (
            <div className="relative h-32 sm:h-48 lg:h-64 bg-gradient-to-br from-emerald-500 to-emerald-700 overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200')] bg-cover bg-center opacity-30"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${type.color} mb-3 text-sm`}>
                    <span className="material-symbols-outlined text-base">{type.icon}</span>
                    <span className="font-semibold">{type.label}</span>
                  </div>
                  <h1 className="text-lg sm:text-2xl lg:text-4xl font-bold">{lesson.title}</h1>
                </div>
              </div>
            </div>
          )}



          {/* Content */}
          {(paragraphs.length > 0 || lesson.type !== 'video') && (
            <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">
              {paragraphs.length > 0 ? (
                <div className="prose prose-slate max-w-none">
                  {paragraphs.map((para, i) => {
                    if (/^\d+\./.test(para.trim())) {
                      return (
                        <div key={i} className="flex gap-3 sm:gap-4 mb-4 p-3 sm:p-4 bg-slate-50 rounded-xl">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 text-sm">
                            {para.trim().match(/^(\d+)\./)?.[1]}
                          </div>
                          <p className="text-slate-700 leading-relaxed flex-1 m-0 text-sm sm:text-base">{para.trim().replace(/^\d+\.\s*/, '')}</p>
                        </div>
                      );
                    }
                    return <p key={i} className="text-slate-700 leading-relaxed mb-5 text-sm sm:text-base lg:text-lg">{para}</p>;
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">description</span>
                  <p className="text-slate-500 text-sm sm:text-base">Bu dars uchun kontent hali qo'shilmagan.</p>
                </div>
              )}
            </div>
          )}
        </article>

        {/* Navigation */}
        {lesson.prevLesson && (
          <div className="mt-4 sm:mt-6">
            <Link to={`/dars/${lesson.prevLesson.id}`} className="group flex items-center gap-3 p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-100 overflow-hidden">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                <span className="material-symbols-outlined text-lg sm:text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-xs text-slate-500 mb-0.5">Oldingi dars</p>
                <p className="font-semibold text-slate-900 truncate text-sm">{lesson.prevLesson.title}</p>
              </div>
            </Link>
          </div>
        )}
      </main>
      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span className="text-sm font-medium">Havola nusxalandi!</span>
        </div>
      )}
    </div>
  );
}



