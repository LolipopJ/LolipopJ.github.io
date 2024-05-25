const redirect = () => {
  const pathname = window.location.pathname
  const prevRouteReg = /^\/(\d{4})\/(\d{2})\/(\d{2})\/(.+)$/

  const prevRouteRes = prevRouteReg.exec(pathname)

  if (prevRouteRes) {
    window.location.replace(
      `/${prevRouteRes[1]}${prevRouteRes[2]}${prevRouteRes[3]}/${prevRouteRes[4]}`,
    )
  }
}

export default redirect
