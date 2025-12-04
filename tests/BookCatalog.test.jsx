import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect,vi, beforeEach } from "vitest"
import BookCatalog from '../src/components/BookCatalog'
import { BrowserRouter } from "react-router-dom"
import axios from "axios"

//Simulare "axios"
vi.mock('axios')

describe('BookCatalog- Functionalitati de baza', ()=>{
 //Date de test comune
 const mockProduct={
  id:1,
  title:'MongoDB: The Definitive Guide',
  author:'Shannon Bradshaw',
  price:39.99,
  description:'Ghidul definitiv pentru MongoDB-de la concepte de baza la arhitecturi avansate.Ideal pentru dezvoltatori care vor sa stapaneasca aceasta baza de date NoSQL populara.',
  category:'MongoDB',
  imageUrl:'https://m.media-amazon.com/images/I/91hgdExbtiL._SL1500_.jpg',
  stock:25,
  specifications: {
   publisher:"O'Reilly Media",
   pages:512,
   year:2019
  }
 }

 const mockCartResponse={
  data:{
   success:true,
   cart:{totalItems:0}
  }
 }
 const mockProductsResponse=(products=[mockProduct])=>({
data: {
 success:true,
 products,
 total:products.length
}
 })

 beforeEach(()=>{
  vi.clearAllMocks()
  //Setup toate testele
  axios.get.mockResolvedValue(mockCartResponse)
 })
const renderComponent= ()=>{
 return render(
  <BrowserRouter>
  <BookCatalog/>
  </BrowserRouter>
 )
}
const waitForLoadingToComplete=async()=>{
 await waitFor(()=>{
  expect(screen.queryByText('Se incarca produsele...')).not.toBeInTheDocument()},{timeout:3000})
 }
 it('ar trebui sa afiseze fara erori si sa incarce produsele', async()=>{
  axios.get.mockResolvedValueOnce(mockProductsResponse())
  renderComponent()
  //Verifica starea initiala de loading
  expect(screen.getByText('Se incarca produsele...')).toBeInTheDocument()
  //Asteapta si verifica incarcarea completa
  await waitForLoadingToComplete()
  expect(screen.getByText('MongoDB: The Definitive Guide')).toBeInTheDocument()
  expect(screen.getByText('MERN BookStore')).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/titlu, autor, descriere/i)).toBeInTheDocument()
 })
 it('ar trebui sa afiseze functionalitatea de cautare', async()=>{
  axios.get.mockResolvedValueOnce(mockProductsResponse())
  renderComponent()
  await waitForLoadingToComplete()
  //Verifica elementele interfetei de cautare
  expect(screen.getByPlaceholderText(/titlu, autor,descriere/i)).toBeInTheDocument()
  expect(screen.getByText(/categorie/i)).toBeInTheDocument()
  expect(screen.getByText(/sortare/i)).toBeInTheDocument()
 })
 it('ar trebui sa afiseze mesaj pentru niciun produs', async()=>{
  axios.get.mockResolvedValueOnce(mockProductsResponse([]))
  renderComponent()
  await waitForLoadingToComplete()
  expect(screen.getByText('Nu sunt produse disponibile')).toBeInTheDocument()
  expect(screen.getByText('0 produse gasite')).toBeInTheDocument()
 })
 it('ar trebui sa afiseze eroarea la incarcarea', async()=>{
 axios.get.mockRejectedValueOnce(new Error('API Error'))
 renderComponent()
 await waitForLoadingToComplete()
 expect(screen.getByText('Eroare la incarcarea produselor')).toBeInTheDocument()
 })
 it('ar trebui sa afiseze starea de loading initial', async()=>{
//simulare intarziere
let resolvePromise
const promise= new Promise(resolve=>{
 resolvePromise=()=>resolve(mockProductsResponse())
})
axios.get.mockReturnValueOnce(promise)
renderComponent()
//Verifica loading inainte de rezolvare
expect(screen.getByText('Se incarca produsele...')).toBeInTheDocument()
//Rezolva promise si asteapta finalizarea
resolvePromise()
await waitForLoadingToComplete()
expect(screen.getByText('MongoDB:The Definitive Guide')).toBeInTheDocument()
 })
})



