import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { describe, it, expect,vi, beforeEach } from "vitest"
import CardSidebar from '../src/components/CardSidebar'
import { BrowserRouter } from "react-router-dom"
import axios from "axios"

//Simulare "axios"
vi.mock('axios')

describe('CardSidebar- Functionalitati cos de cumparaturi', async()=>{
 const mockCartItems=[
  {
   productId:101,
   title:'MongoDB:The Definitive Guide',
   author:'Shannon Bradshaw',
   price:39.99,
   quantity:2,
   imageUrl:'https://m.media-amazon.com/images/I/91hgdExbtiL._SL1500_.jpg',
  }
 ]
 const mockCart={
  items:mockCartItems,
  total:79.98,
  totalItems:2
 }

 const mockOnClose=vi.fn()
 const mockCartResponse={
  data:{ success:true, cart:mockCart}
 }
 const mockEmptyCartResponse={
  data:{
   success:true,
   cart:{
    items:[],
    total:0,
    totalItems:0
   }
  }
 }
 beforeEach(()=>{
  vi.clearAllMocks()
  global.fetch=vi.fn()
  global.alert=vi.fn()
 })

 const renderComponent=(isopen=true)=>{
return render(
 <BrowserRouter>
 <CardSidebar isopen={isopen} onClose={mockOnClose}/>
 </BrowserRouter>
)
 }
//Teste de baza
it('nu ar trebui sa fie vizibil cand isopen este false', ()=>{
 renderComponent(false)
 expect(screen.queryByText('Cosul de cumparaturi')).not.toBeInTheDocument()
})
it('ar trebui sa afiseze cosul cu produse cand este deschis', async()=>{
 axios.get.mockResolvedValueOnce(mockCartResponse)
 renderComponent(true)
 await waitFor(()=>{
expect(screen.getByText('Cosul de cumpraturi')).toBeInTheDocument()
expect(screen.getByText('MongoDB: The Definitive Guide')).toBeInTheDocument()
expect(screen.getByText('de Shannon Bradshaw')).toBeInTheDocument()
 })
})
it('ar trebui sa afiseze cosul gol corect', async()=>{
 axios.get.mockResolvedValueOnce(mockEmptyCartResponse)
 renderComponent(true)
 await waitFor(()=>{
  expect(screen.getByText('Total produse: 2')).toBeInTheDocument()
  expect(screen.getByText(/79.98 RON/)).toBeInTheDocument()
 })
})
it('ar trebui sa inchida sidebar-ul la click pe overlay', async()=>{
 axios.get.mockResolvedValueOnce(mockCartResponse)
 renderComponent(true)
 await waitFor(()=>{
  expect(screen.getByText('Cosul de cumparaturi')).toBeInTheDocument()
 })
 const overlay=document.querySelector('.card-sidebar-overlay')
 fireEvent.click(overlay)
 expect(mockOnClose).toHaveBeenCalled()
})

it('ar trebui sa inchida sidebar-ul la click pe butonul de inchidere', async()=>{
 axios.get.mockResolvedValueOnce(mockCartResponse)
 renderComponent(true)
 await waitFor(()=>{
  expect(screen.getByText('Cosul de cumparaturi')).toBeInTheDocument()
 })
 const closeButton=screen.getByText('x')
 fireEvent.click(closeButton)
 expect(mockOnClose).toHaveBeenCalled()
})
it('ar trebui sa afiseze butonul de checkout cu pretul corect', async()=>{
 axios.get.mockResolvedValueOnce(mockCartResponse)
 renderComponent(true)
 await waitFor(()=>{
  expect(screen.getByText('Finalizeaza comanda- 99.97 RON')).toBeInTheDocument()
 })
})

it('ar trebui sa gestioneze checkout-ul cu succes fara erori', async()=>{
 axios.get.mockResolvedValueOnce(mockCartResponse)
 //Simulatre pentru checkout cu succes
 global.fetch.mockResolvedValueOnce({
ok:true,
json: async()=>({success:true,sessionUrl:'https://checkout.stripe.com/sesion_123'})
})
//Simulare pentru window.location pentru a evita erori de navigare
const originalLocation=window.location 
delete window.location 
window.location={href:''}
renderComponent(true)
await waitFor(()=>{
 expect(screen.getByText('Finalizeaza comanda -99.97 RON')).toBeInTheDocument()
})
const checkoutButton=screen.getByText('Finalizeaza comanda - 99.97 RON')
fireEvent.click(checkoutButton)
await waitFor(()=>{
 expect(global.fetch).toHaveBeenCalled()
})
//Restaureaza window.location
window.location=originalLocation
})
//Test simplificat pentru butonul de stergere-doar verifica ca exista
it('ar trebui sa afiseze butoanele de stergere pentru produse', async()=>{
 axios.get.mockResolvedValueOnce(mockCartResponse)
 renderComponent(true)
 await waitFor(()=>{
expect(screen.getByText('MongoDB: The Definitive Guide')).toBeInTheDocument()
expect(screen.getByText('Sterge')).toBeInTheDocument()
 })
})
it('ar trebui sa afiseze informatiile complete ale produselor', async()=>{
 axios.get.mockResolvedValueOnce(mockCartResponse)
 renderComponent(true)
await waitFor(()=>{
 expect(screen.getByText('MongoDB: The Definitive Guide')).toBeInTheDocument()
 expect(screen.getByText('de Shannon Bradshaw')).toBeInTheDocument()
 expect(screen.getByText('39.99 RON')).toBeInTheDocument()
 expect(screen.getByText('x2')).toBeInTheDocument()
})
})
it('ar trebui sa afiseze butonul de checkout enabled initial', async()=>{
 axios.get.mockResolvedValueOnce(mockCartResponse)
 renderComponent(true)
 await waitFor(()=>{
  const checkoutButton=screen.getByText('Finalizeaza comanda-99.97 RON')
  expect(checkoutButton).not.toBeDisabled()
 })
})
})
 


