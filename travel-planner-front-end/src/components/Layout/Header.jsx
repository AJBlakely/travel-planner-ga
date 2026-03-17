import './Header.css'

const Header = () => {
  return (
    <header className='site-header'>
      <div className='site-header-overlay'>
        <div className='site-header-content'>
          <span className='site-logo-dot' />
          <div>
            <h1 className='site-title'>WindowSeat</h1>
            <p className='site-subtitle'>Collect the journeys that move you.</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header