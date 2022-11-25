import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { BigNumber, ethers } from 'ethers';
import { environment } from 'src/environments/environment';
import tokenJson from '../assets/MyToken.json';
import ballotJson from '../assets/TokenizedBallot.json';

const ERC20VOTES_TOKEN_ADDRESS = "0x324c938062235e86dBF068AC2ede9211fE5f842f";
const BALLOT_TOKEN_ADDRESS = "0xeb61651f31E5be7B7006F3C5a6ce7BD776A5643e";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  wallet: ethers.Wallet | undefined;
  provider: ethers.providers.BaseProvider | undefined;

  tokenContractAddress: string | undefined;
  // ballotContractAddress: string | undefined;

  etherBalance: number | undefined;
  tokenBalance: number | undefined;
  votePower: number | undefined;
  tokenContract: ethers.Contract | undefined;
  ballotContract: ethers.Contract | undefined;

  constructor(private http: HttpClient){}

  createWallet(){
    this.provider = new ethers.providers.AlchemyProvider("goerli", environment.ALCHEMY_API_KEY);
    this.wallet = ethers.Wallet.fromMnemonic(environment.MNEMONIC).connect(this.provider);
    this.http.get<any>(`${environment.API_URL}/token-address`).subscribe((ans)=>{
      this.tokenContractAddress = ans?.result;
      if(this.tokenContractAddress && this.wallet){
        this.tokenContract = new ethers.Contract(
          this.tokenContractAddress, 
          tokenJson.abi, 
          this.wallet
        );
        this.tokenContract.on("Transfer", ()=> this.updateBlockchainInfo());
        this.tokenContract.on("DelegateChanged", ()=> this.updateBlockchainInfo());
      }
      this.updateBlockchainInfo();
    });
    this.ballotContract = new ethers.Contract(
      BALLOT_TOKEN_ADDRESS,
      ballotJson.abi,
      this.wallet
    );
  }

  private updateBlockchainInfo() {
    if(this.tokenContractAddress && this.tokenContract && this.wallet){
      this.wallet.getBalance().then((balanceBn)=>{
        this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBn));
      });
      this.tokenContract["balanceOf"](this.wallet.address).then((tokenBalanceBn: BigNumber)=>{
        this.tokenBalance = parseFloat(ethers.utils.formatEther(tokenBalanceBn));
      });
      this.tokenContract["getVotes"](this.wallet.address).then((votePowerBn: BigNumber)=>{
        this.votePower = parseFloat(ethers.utils.formatEther(votePowerBn));
      });
    }
  }

  async vote(voteId: string){
    console.log("trying to vote for " + voteId);
    // TODO: this.ballotContract["vote"](voteId);
    let voteTx;
    if(this.ballotContract){
      voteTx = await this.ballotContract['vote'](voteId, ethers.utils.parseEther("0.1"),{gasLimit: 50000});
      await voteTx.wait();
      console.log(voteTx.hash);
    }
  }

  async delegate(address: string){
    // TODO: allow user to delegate to another address
    // EVENT: DelegateChanged(delegator, currentDelegate, delegatee)
    let dgTx;
    if(this.tokenContract) {
      dgTx = await this.tokenContract['delegate'](address);
      await dgTx.wait();
      console.log(dgTx.hash);
    }
  }

  getListofProposals(){
    // TODO: list proposals on front-end
  }

  getWinningProposal(){
    // TODO: show winning proposal
  }

  request(){
    // POST request to mint tokens for logged-in wallet
    this.http
      .post<any>(`${environment.API_URL}/request-tokens`, {
        address: this.wallet?.address,
        amount: 2
      }).subscribe((ans)=> {
        this.updateBlockchainInfo();
    });
  }

}
