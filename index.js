const GAME_STATE = {
    FirstCardAwaits: "FirstCardAwaits",
    SecondCardAwaits: "SecondCardAwaits",
    CardsMatchFailed: "CardsMatchFailed",
    CardsMatched: "CardsMatched",
    GameFinished: "GameFinished",
  }
  
  const Symbols = [
    "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
    "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
    "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
    "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png" // 梅花
  ];
  const view = {
    getCardContent(index) {
      const number = this.transformNumber((index % 13) + 1);
      const symbol = Symbols[Math.floor(index / 13)];
      return `<p>${number}</p>
      <img src="${symbol}" alt="">
      <p>${number}</p>`;
    },
    
    getCardElement(index) {
      return `<div data-index="${index}" class="card back"></div>`;
    },
    
    transformNumber(number) {
      switch (number) {
        case 1:
          return "A";
        case 11:
          return "J";
        case 12:
          return "Q";
        case 13:
          return "K";
        default:
          return number;
      }
    },
    
    displayCards(indexes) {
      const rootElement = document.querySelector("#cards");
      rootElement.innerHTML = indexes.map((index) => this.getCardElement(index))
        .join("");
    },
    
    // ...cards會回傳陣列  
    flipCards(...cards) {
      cards.map(card => {
         if (card.classList.contains("back")) {
        // 回傳正面
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        return;
      }
      // 回傳背面
      card.classList.add("back");
      card.innerHTML = null;
      })
    },
    
    pairCards(...cards) {
      cards.map(card => {
        card.classList.add('paired')
      }) 
    },
    
    renderScore(score) {
      document.querySelector('.score').textContent = `Score: ${score}`;
    },
    
    renderTriedTimes(times) {
      document.querySelector('.tried').textContent =  `You've tried: ${times} times`;
    },
    
    appendWrongAnimation(...cards) {
      cards.map(card => {
        card.classList.add('wrong')
        card.addEventListener('animationend', event => {
          event.target.classList.remove('wrong'),
            {
            once: true
          }
        })
      })
    },
    
    showGameFinished() {
      const div = document.createElement('div')
      div.classList.add('completed')
      div.innerHTML = `
        <p>Complete!</p>
        <p>Score: ${model.score}</p>
        <p>You've tried: ${model.triedTimes} times</p>
      `
      const header = document.querySelector('#header')
      header.before(div)
    },
  };
  
  const model = {
    // 暫存牌組
    revealedCards: [],
    
    // 判斷有沒有配對成功，回傳true / false 
    isRevealedCardsMatched(){
      return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
    },
    
    score: 0,
    
    triedTimes: 0,
  }
  
  const utility = {
    getRandomNumberArray(count) {
      //     count = 5 => [2, 4, 3, 1, 0] 回傳隨機的數字陣列
      const number = Array.from(Array(count).keys());
      for (let index = number.length - 1; index > 0; index--) {
        let randomIndex = Math.floor(Math.random() * (index + 1));
        [number[index], number[randomIndex]] = [
          number[randomIndex],
          number[index]
        ];
      }
      return number;
    }
  };
  
  const controller = {
    // 標記目前的遊戲狀態「還沒翻牌」
    currentState: GAME_STATE.FirstCardAwaits,
    
    generateCards(){
      view.displayCards(utility.getRandomNumberArray(52))
    },
    //  依照不同的遊戲狀態，做不同的行為
    dispatchCardAcrion(card) {
      if(!card.classList.contains('back')) {
        return
      }
      switch (this.currentState) {
        case GAME_STATE.FirstCardAwaits:
          view.flipCards(card)
          model.revealedCards.push(card)
          this.currentState = GAME_STATE.SecondCardAwaits
          break
        case GAME_STATE.SecondCardAwaits:
          view.renderTriedTimes(++model.triedTimes)
          view.flipCards(card)
          model.revealedCards.push(card)
          // 判斷成功與否
          if (model.isRevealedCardsMatched()) {
          // matched
            view.renderScore(model.score += 10)
            this.currentState = GAME_STATE.CardsMatched
            view.pairCards(...model.revealedCards)
            model.revealedCards = []
            if(model.score === 260) {
              console.log('showGameFinished')
              this.currentState = GAME_STATE.GameFinished
              view.showGameFinished()
              return
            }
            this.currentState = GAME_STATE.FirstCardAwaits
          } else {
           // unmatched
            this.currentState = GAME_STATE.CardsMatchFailed
            view.appendWrongAnimation(...model.revealedCards)
            setTimeout(this.resetCards, 1000) // 1000 -> 1s
          }
          break
      }
      console.log('this.currentState', this.currentState)
      console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
    },
    resetCards() {
      view.flipCards(...model.revealedCards)
      model.revealedCards = []
      controller.currentState = GAME_STATE.FirstCardAwaits
    }
  }
  
  controller.generateCards();
  
  // Node List (array-like)
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", (event) => {
      controller.dispatchCardAcrion(card)
    });
  });
  
  // Array.from(Array(52).keys())
  // [0, 1, 2, 3, 4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51]
  
  // .map()回傳的是陣列，但HTML不可以是陣列型式，所以要把這些元素合併成一個大字串用join("")
  