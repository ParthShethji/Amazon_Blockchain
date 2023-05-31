// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Amazon {
    address public owner;

    struct Item {
        uint256 id;
        string  name;
        string  cateogary;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }

    struct Order{
        uint256 time;
        Item item;
    }

// string  image;
    mapping (uint256 => Item) public items;
    mapping (address => uint256) public ordercount;
    mapping (address => mapping (uint256 => Order))public orders;
     
    event List(string name, uint256 cost, uint256 stock);
    event Buy(address buyer, uint256 orderid, uint256 itemid);


    
    constructor (){
        owner =  msg.sender;
    }

    // list products
    function list(
        uint256 id,
        string memory name,
        string memory cateogary,
        // string memory image,
        uint256 cost, 
        uint256 rating,
        uint256 stock
    )  public {
        // create item struct 
        Item memory item = Item(id, name, cateogary, cost, rating, stock);

        // save it   
        items[id] = item;   
 
        //emit an event
        emit List(name, cost, stock);
    }

    // buy products
    // receive cryto\ -  payable
    function buy(uint256 id) public payable{  
        // fetch item from blockchain
        Item memory item = items[id];

        // cerate order
        Order memory order = Order(block.timestamp, item);

        // save order to chain
        ordercount[msg.sender]++;
        orders[msg.sender][ordercount[msg.sender]]=order;

        // subtract stock
        items[id].stock = item.stock-1;

        // emit event
        emit Buy(msg.sender, ordercount[msg.sender], item.id);
    }



    // withdraw funds

    function withdraw() public {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }

}
