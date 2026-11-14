import { useState, type FormEvent } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

interface FormData {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}

const INITIAL_FORM_DATA: FormData = {
  name: '',
  email: '',
  category: 'general',
  subject: '',
  message: '',
};

export function ContactSection() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('https://formspree.io/f/mqpqegko', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          이름: formData.name,
          이메일: formData.email,
          문의유형: formData.category,
          제목: formData.subject,
          문의내용: formData.message,
          제출일시: new Date().toLocaleString('ko-KR'),
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData(INITIAL_FORM_DATA);
      } else {
        const errorData = await response.json().catch(() => null);
        setStatus('error');
        setErrorMessage(
          errorData?.errors?.[0]?.message ||
            '문의 전송 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'
        );
      }
    } catch {
      setStatus('error');
      setErrorMessage('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="bg-white border border-slate-200 rounded-xl p-5 sm:p-8"
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="contact-heading" className="text-lg sm:text-xl font-bold text-slate-900">
              고객 문의 및 피드백
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              서비스 이용 중 불편한 점이나 제안하고 싶은 기능이 있다면 언제든 알려주세요.
            </p>
          </div>
        </div>

        {status === 'success' ? (
          <div className="py-10 text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                문의가 성공적으로 접수되었습니다!
              </h3>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                소중한 의견 감사합니다. 남겨주신 연락처로 검토 후 신속히 안내해 드리겠습니다.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                새로운 문의 작성하기
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {status === 'error' && (
              <div
                role="alert"
                className="flex items-start gap-3 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm"
              >
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">전송 실패</p>
                  <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  성함 / 닉네임 <span className="text-rose-500">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="예: 홍길동"
                  disabled={status === 'submitting'}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  답변받을 이메일 <span className="text-rose-500">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  disabled={status === 'submitting'}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="contact-category"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  문의 유형
                </label>
                <select
                  id="contact-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={status === 'submitting'}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all disabled:opacity-50"
                >
                  <option value="general">일반 문의</option>
                  <option value="feature">기능 제안 / 개선 요청</option>
                  <option value="bug">오류 / 버그 신고</option>
                  <option value="partnership">제휴 및 기타</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  문의 제목 <span className="text-rose-500">*</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="문의 제목을 입력해 주세요"
                  disabled={status === 'submitting'}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                문의 내용 <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="궁금하신 점이나 제안사항을 자세히 적어주시면 빠른 답변에 도움이 됩니다."
                disabled={status === 'submitting'}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all resize-y disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                작성하신 내용은 문의 처리 및 답변 안내 목적으로 안전하게 전달됩니다.
              </p>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] disabled:opacity-60 rounded-lg transition-all cursor-pointer shadow-xs"
              >
                {status === 'submitting' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>전송 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>문의하기 전송</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
