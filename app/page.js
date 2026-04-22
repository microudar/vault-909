<div className="mb-6 flex gap-2 overflow-x-auto border-b border-zinc-800 pb-0">
  {sheets.map((sheet) => (
    <button
      key={sheet.name}
      onClick={() => {
        setActiveSheet(sheet.name)
        setQuery('')
      }}
      className={`relative px-5 py-3 text-sm font-medium transition whitespace-nowrap rounded-t-xl border border-b-0 ${
        activeSheet === sheet.name
          ? 'bg-zinc-900 text-white border-zinc-700'
          : 'bg-zinc-950 text-zinc-500 border-transparent hover:text-white hover:bg-zinc-900/50'
      }`}
    >
      {sheet.name}
    </button>
  ))}
</div>
