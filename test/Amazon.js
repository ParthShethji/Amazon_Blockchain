const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}


const id = 1
const name = "shoes"
const cateogary = "Clothing"
const cost = tokens(1)
const rating = 4
const stock =  5

describe("Amazon", function () {
  let amazon;
  let Amazon;
  let owner;
  let buyer1;
  let buyer2;

  beforeEach(async function (){
    Amazon = await ethers.getContractFactory("Amazon");
    [owner, buyer1, buyer2] =  await ethers.getSigners();
    amazon = await Amazon.deploy();
  })

  describe("deployment", function(){
    it("be same owner", async function(){
      expect(await amazon.owner()).to.equal(owner.address)
    })
  })

  describe("list functionality", function(){
    let listing;
    beforeEach(async function(){
      listing = await amazon.connect(owner).list(
        id,
        name,
        cateogary,
        cost,
        rating,
        stock
      )
      await listing.wait()
    })
    it("show items", async function(){
      const item = await amazon.items(1)
      expect(item.id).to.equal(id)
      expect(item.name).to.equal(name)
      expect(item.cateogary).to.equal(cateogary)
      expect(item.cost).to.equal(cost)
      expect(item.rating).to.equal(rating)
      expect(item.stock).to.equal(stock)
    })
    it("emit an event", async function(){
      expect(listing).to.emit(Amazon, "List")
    })
  })
  describe("buying", () =>{
    let buying;
    beforeEach(async ()=>{
      buying = await amazon.connect(owner).list(
        id,
        name,
        cateogary,
        cost,
        rating,
        stock
      )
      await buying.wait()
      buying = await amazon.connect(buyer1).buy(id, {value: cost})
      await buying.wait()
    })
    it("must update balance", async ()=>{
      const result = await ethers.provider.getBalance(amazon.address)
      console.log(result)
      expect(result).to.equal(cost)
    })
    it("update buyers ordercount", async()=>{
      const count = await amazon.connect(buyer1).ordercount(buyer1.address)
      expect(count).to.equal(1)
    })
    it("add the order", async ()=>{
      const order = await amazon.orders(buyer1.address, 1)
      expect(order.time).to.greaterThan(1)
      expect(order.item.name).to.equal(name)
    })
    it("emits buy event", async()=>{
      expect(buying).to,this.emit(amazon, "buy")
    })
  })
  
  describe("Withdrawing", () => {
    let balanceBefore

    beforeEach(async () => {
      // List a item
      let transaction = await amazon.connect(owner).list(id, name, cateogary, cost, rating, stock)
      await transaction.wait()

      // Buy a item
      transaction = await amazon.connect(buyer1).buy(id, { value: cost })
      await transaction.wait()

      // Get Deployer balance before
      balanceBefore = await ethers.provider.getBalance(owner.address)

      // Withdraw
      transaction = await amazon.connect(owner).withdraw()
      await transaction.wait()
    })

    it('Updates the owner balance', async () => {
      const balanceAfter = await ethers.provider.getBalance(owner.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it('Updates the contract balance', async () => {
      const result = await ethers.provider.getBalance(amazon.address)
      expect(result).to.equal(0)
    })
  })
})