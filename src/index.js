import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// 마우스를 올렸을 때 가져올 수 있는 적의 돌을 배열로 가져온다. (8방항 확인)
let getPossible = (current, i, j, ally, enemy)=>{
  let temp =[];
  temp=temp.concat(getPossibleLine(current,i,j,-1,-1,ally,enemy));
  temp=temp.concat(getPossibleLine(current,i,j,-1,0,ally,enemy));
  temp=temp.concat(getPossibleLine(current,i,j,-1,1,ally,enemy));
  temp=temp.concat(getPossibleLine(current,i,j,0,1,ally,enemy));
  temp=temp.concat(getPossibleLine(current,i,j,1,1,ally,enemy));
  temp=temp.concat(getPossibleLine(current,i,j,1,0,ally,enemy));
  temp=temp.concat(getPossibleLine(current,i,j,1,-1,ally,enemy));
  temp=temp.concat(getPossibleLine(current,i,j,0,-1,ally,enemy));
  return temp;
}

// 마우스롤 올렸을 때 가져올 수 있는 줄을 방향을 정하여 검사한다.
let getPossibleLine = (current, i, j, i_weight, j_weight, ally, enemy)=>{
  let possible=[];
  let loop = 0;
  let i_index = i_weight;
  let j_index = j_weight;
  while(i+i_index <8 && i+i_index >=0 && j+j_index <8 && j+j_index >=0 ){
    const square = current[i+i_index][j+j_index];

    if(square===enemy) {
      i_index += i_weight;
      j_index += j_weight;
      loop++;
    }else if(square==="empty" || square ==="empty possible"){
      break;
    }else if(square===ally ){
      if(loop ===0) break;

      while(loop>0){
        i_index -= i_weight;
        j_index -= j_weight;
        possible.push([i+i_index,j+j_index]);
        loop--;
      }
      break;
    }
  }

  return possible;
}

// 적의 돌을 가져올 수 있는 위치인지 확인후 boolean 반환
let isPossibleSquare = (current, i, j, ally, enemy)=>{
    if(current[i][j] !=="empty" && current[i][j] !=="empty possible") return false;
    if(getPossibleLine(current,i,j,-1,-1,ally,enemy).length) return true;
    if(getPossibleLine(current,i,j,-1,0,ally,enemy).length) return true;
    if(getPossibleLine(current,i,j,-1,1,ally,enemy).length) return true;
    if(getPossibleLine(current,i,j,0,1,ally,enemy).length) return true;
    if(getPossibleLine(current,i,j,1,1,ally,enemy).length) return true;
    if(getPossibleLine(current,i,j,1,0,ally,enemy).length) return true;
    if(getPossibleLine(current,i,j,1,-1,ally,enemy).length) return true;
    if(getPossibleLine(current,i,j,0,-1,ally,enemy).length) return true;
    return false;
}

// 적의 돌을 가져올 수 있는 위치를 담은 배열을 반환
let displayPossibleSquare = (current, ally, enemy)=>{
  current= clearPossibleSquare(current)
  for(let i = 0 ; i < 8 ; i ++){
    for(let j = 0 ; j < 8 ; j ++ ){
      if(isPossibleSquare(current,i, j, ally, enemy)){
        current[i][j] = "empty possible"
      }
    }
  }
  return current;
}

// empty possible 클래스를 empty로 모두 변환
let clearPossibleSquare = (current)=>{
  for(let i = 0 ; i < 8 ; i ++){
    for(let j = 0 ; j < 8 ; j ++){
      if(current[i][j] === "empty possible"){
        current[i][j] = "empty";
      }
    }
  }
  return current;
}

let countScore = (current) =>{
  let black=0, white=0;
  for(let i = 0 ; i < 8 ; i ++){
    for(let j = 0 ; j < 8 ; j ++){
      if(current[i][j] ==="black"){
        black++;
      }else if(current[i][j]==="white"){
        white++;
      }
    }
  }
  return [black, white];
}


//Player 클래스
let Player = (props)=>{
    let profile="profile";
    if(props.color === "black"){
      profile = props.blackTurn ? profile+" turn" : profile;
    }else{
      profile = !props.blackTurn ? profile+" turn" : profile;
    }
    
    return(
      <div>
      <div className={profile}>
        {props.color}
      </div>
      <div className="score">
          {props.score}
      </div>
      </div>
    )

}

//Stone
let Stone = (props)=>{
  return(
    <div className={props.value}>

    </div>
  )
}

//Square
let Square = (props)=>{

  return(
    <div className="square"
    onClick={props.onClick}
    onMouseOver={props.onMouseOver}
    >
      <Stone
        value = {props.value}
      />
    </div>
  )
}

class Board extends React.Component{

  renderSquare(i,j){
    let keyName ="col"+j;
    return (
      <Square 
        value={this.props.squares[i][j]}
        key = {keyName}
        onClick={()=>this.props.onClick(i,j)}
        onMouseOver = {()=>this.props.onMouseOver(i,j)}
      />
    )
  }
  render(){

    return (
      <div className="board" >
        {this.props.squares.map((row, row_index)=>{
          return (<div className="row" key={"row"+row_index} >{
            row.map((value,col_index)=>{
            return this.renderSquare(row_index,col_index);
          })
          }
          </div>)
        })}
      </div>
    )
  }
}




class Game extends React.Component{
  constructor(props){
    super(props);
    const temp = Array(8);
    for(let i = 0 ; i < 8 ; i ++){
      temp[i] = Array(8).fill("empty");
    }
    this.state ={
      history:[{squares:temp,}],
      stepNumber:0,
      blackTurn:true,
      possible:[],
      score:[],
    }
    let history = this.state.history;
    history[0].squares[3][3]="black";
    history[0].squares[3][4]="white";
    history[0].squares[4][3]="white";
    history[0].squares[4][4]="black";
    let current = displayPossibleSquare(history[0].squares,"black","white")
    history.pop();
    history.push({squares:current})
    this.state.score =[2,2];
  }
 

  //스퀘어를 눌렀을 경우.
  squareClick(i, j){
    const possible = this.state.possible;
    if(possible.length ===0) return;
    const history = this.state.history;
    const stepNumber = this.state.stepNumber
    const blackTurn = this.state.blackTurn;
    const score = this.state.score;
    const current = history[stepNumber].squares;    
    const ally = blackTurn ? "black" : "white";
    const enemy = blackTurn ? "white" : "black";

    
    let next = current.slice();
    next[i][j] = ally;
    for(let i in possible) next[possible[i][0]][possible[i][1]] = ally;
    next = displayPossibleSquare(next,enemy,ally)
    let nextScore = countScore(next);
    history.push({squares:next})
    this.setState({
      stepNumber: stepNumber+1,
      blackTurn: !blackTurn,
      history: history,
      possible: [],
      score:nextScore,
    })

  }


  //가능한 스퀘어에서 어떤 돌을 뒤집을 수 있는지 확인
  preview(i, j){
    const history = this.state.history;
    const blackTurn = this.state.blackTurn;
    const possible = this.state.possible;
    let current = history[this.state.stepNumber].squares.slice();  
    const ally = blackTurn ? "black" : "white";
    const enemy = blackTurn ? "white" : "black";

    for(let i in possible) current[possible[i][0]][possible[i][1]] = enemy;
    
    history.pop();
    history.push({squares:current,})
    this.setState({
      possible:[],
      history:history,      
    })

    if(current[i][j] !== "empty" && current[i][j] !== "empty possible") return;
    let nextPossible= getPossible(current, i,j,ally, enemy)
    for(let i in nextPossible) current[nextPossible[i][0]][nextPossible[i][1]] = enemy + " possible"
    history.pop();
    history.push({squares:current,})
    this.setState({
      possible:nextPossible,
      history:history,
    })
  }
  
  render(){
    const history = this.state.history;
    let current = history[this.state.stepNumber].squares;    

    return (
      <div className = "game">
        <div className ="player-frame black">
          <Player
            color="black"
            blackTurn={this.state.blackTurn}
            score={this.state.score[0]}
          />
        </div>
        <div className="board-frame">
        <Board 
          squares={current}
          onClick={(i,j)=>{this.squareClick(i,j)}}
          onMouseOver ={(i,j)=> {this.preview(i,j)}}
        />
        </div>
        <div className ="player-frame white">
          <Player
            color="white"
            blackTurn={this.state.blackTurn}  
            score={this.state.score[1]}
          />
        </div>
      </div>
    )
  }
}

ReactDOM.render(
  <div id="main-frame">
    <Game/>
  </div>,
  document.getElementById('root')
);

  

