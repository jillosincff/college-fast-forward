
export function Button({
  children, variant='primary', className='', ...props
}) {
  const map = {
    primary: 'btn btn-primary',
    ghost:   'btn btn-ghost',
    accent:  'btn btn-accent',
    secondary: 'btn btn-secondary',
    blue:    'btn bg-gator-blue text-white shadow-md hover:bg-gator-blue/90 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-gator-blue/40 transition-all duration-200',
    orange:  'btn bg-gator-orange text-white shadow-md hover:bg-gator-orange/90 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-gator-orange/40 transition-all duration-200',
  };
  
  return <button className={`${map[variant]} ${className}`} {...props}>{children}</button>
}