// Os links abrem normalmente; o evento de conversão é enviado sem bloquear o WhatsApp.
document.querySelectorAll('a[href*="wa.me/"]').forEach(link=>{
  link.addEventListener('click',()=>{
    if(typeof window.gtag==='function')window.gtag('event','conversion',{
      send_to:'AW-18451415875/5W4YCPSApfwcEMOGqd5E',
      value:1.0,currency:'BRL'
    });
  });
});
