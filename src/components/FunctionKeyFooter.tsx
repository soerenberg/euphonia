import './FunctionKeyFooter.css'

export interface FunctionKey {
  key: string
  label: string
  onPress?: () => void
}

interface FunctionKeyFooterProps {
  keys: FunctionKey[]
}

export function FunctionKeyFooter({ keys }: FunctionKeyFooterProps) {
  return (
    <div className="function-key-footer">
      {keys.map((k) => (
        <button
          key={k.key}
          type="button"
          className="function-key"
          onClick={k.onPress}
          disabled={!k.onPress}
        >
          <span className="function-key-bracket">[{k.key}]</span>
          {k.label}
        </button>
      ))}
    </div>
  )
}
