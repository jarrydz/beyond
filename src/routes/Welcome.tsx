import { useNavigate } from 'react-router-dom';
import { brand } from '@/config/brand';

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div
      className="absolute inset-0 z-[80] flex flex-col justify-between text-center text-cream"
      style={{
        padding: '70px 30px 40px',
        background:
          'radial-gradient(700px 380px at 50% -5%, #6F8472 0%, transparent 60%), linear-gradient(180deg, #3A5145 0%, #2C3B33 100%)',
      }}
    >
      <div>
        <div className="w-16 h-16 mx-auto mb-[18px] rounded-[20px] bg-white/10 border border-white/20 flex items-center justify-center">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F1ECE2"
            strokeWidth="1.6"
          >
            <path d="M12 21c5-4 8-7 8-11a4 4 0 0 0-8-1 4 4 0 0 0-8 1c0 4 3 7 8 11Z" />
          </svg>
        </div>
        <h1 className="font-serif font-semibold text-[40px] tracking-wide leading-none">
          {brand.name}
        </h1>
        <div className="text-[13px] tracking-[0.22em] uppercase opacity-75 mt-1">
          {brand.tagline}
        </div>
      </div>

      <div>
        <p className="font-serif font-medium text-[27px] leading-snug mb-3.5">{brand.hero}</p>
        <p className="text-[15px] leading-relaxed opacity-85 mx-auto max-w-[280px]">
          {brand.lead}
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={() => navigate('/signin')}
          className="w-full font-semibold text-sm rounded-btn py-[13px] px-[18px] transition active:scale-[0.975] bg-[#F1ECE2] text-green-deep hover:brightness-105"
        >
          Continue your journey
        </button>
      </div>
    </div>
  );
}
