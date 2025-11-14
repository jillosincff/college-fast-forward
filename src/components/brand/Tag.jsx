
export function Tag({children, tone='default', className=''}) {
  const toneClass = {
    default:'tag tag--default',
    active:'tag tag--active',
    featured:'tag tag--featured',
    new:'tag tag--new'
  }[tone]
  return <span className={`${toneClass} ${className}`}>{children}</span>
}