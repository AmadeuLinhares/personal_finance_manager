export function AppFooter() {
  return (
    <footer className='mt-auto border-t border-divider'>
      <div className='mx-auto flex max-w-[1240px] flex-wrap justify-between gap-2 px-4 py-3 text-label text-ink/70'>
        <span>Folio · layout only — no API integration yet</span>
        <span className='tabular-nums'>
          integer minor units · YYYY-MM-DD dates · CAD default, USD never summed
        </span>
      </div>
    </footer>
  );
}
