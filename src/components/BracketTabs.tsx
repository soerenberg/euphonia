import './BracketTabs.css'

export interface BracketTab {
  id: string
  label: string
}

interface BracketTabsProps {
  tabs: BracketTab[]
  activeId: string
  onSelect: (id: string) => void
}

export function BracketTabs({ tabs, activeId, onSelect }: BracketTabsProps) {
  return (
    <div className="bracket-tabs" role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className="bracket-tab"
            onClick={() => onSelect(tab.id)}
          >
            {isActive ? `[ ${tab.label} ]` : tab.label}
          </button>
        )
      })}
    </div>
  )
}
