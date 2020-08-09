import { Component, State, h } from '@stencil/core';

@Component({
  tag: 'app-twilio-sms',
  styleUrl: 'app-twilio-sms.css',
  shadow: true,
})

export class AppTwilioSms {
    @State() name: string;
    @State() phoneNumber: string;
    @State() message: string;
    @State() phoneFlag: boolean = true;
    @State() messageArray: any[] = [];


    sendMessage = async (data) => {
        let response = await fetch("http://localhost:5000/api/v1/twillio/sms/send", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        let jsonResponse = await response.json();
        this.messageArray = [...this.messageArray, {id: jsonResponse.sid, type: "sent", message: jsonResponse.body}];
    }

    getMessages = async () => {
        let response = await fetch("http://localhost:5000/api/v1/twillio/sms/get");
        let jsonResponse = await response.json();
        jsonResponse.data.forEach(newMessage => {
            if(!this.messageArray.some(oldMessage => oldMessage.id === newMessage.SmsMessageSid)){
                this.messageArray = [...this.messageArray, {id: newMessage.SmsMessageSid, type: "received", message: newMessage.Body}];
            }
        });
        
    }

    validatePhoneNumber = (phoneNumber) => {
        return /^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/.test(phoneNumber);
    }
    
    handleSubmit = async (e) =>  {
      e.preventDefault()
      if(this.validatePhoneNumber(this.phoneNumber)) {
          const strippedNumber = this.phoneNumber.replace(/[()-.+]/gi, '')
      const formObj = {
        twilioTo: `+${strippedNumber}`,
        messageBody: this.message
      }
      this.sendMessage(formObj)
      this.phoneFlag = true;
      }else {
        this.phoneFlag = false;
      }
    }
  
    handleChangeName(e) {
        this.name = e.target.value;
    }
    handleChangeNumber(e) {
        this.phoneNumber = e.target.value;
    }
    handleChangeMessage(e) {
        this.message = e.target.value;
    }
  
    render() {
        return (
          <div class="container">
            <form class="form-wrapper" onSubmit={(e) => this.handleSubmit(e)}>
                <input placeholder="Name" type="text" required autofocus value={this.name} onInput={(event) => this.handleChangeName(event)} />
                <input placeholder="Phone Number"type="text" value={this.phoneNumber} onInput={(event) => this.handleChangeNumber(event)} />
                {this.phoneFlag === false && <div style={{color:'red'}}>Please enter a valid phone number</div>}
                <textarea placeholder="Type your message here...." required value={this.message} onInput={(event) => this.handleChangeMessage(event)}/>
                <input class="button" type="submit" value="Send" />
            </form>
            <input class="button" type="button" value="Refresh" onClick={() => this.getMessages()} />
            <div class="chat">
                <div class="messages">
                {
                    this.messageArray?.map((item: any) => (
                        <div class={item.type === "sent" ? "sent message" : "received message"}>{item.message}</div>
                    ))
                }
                </div>
            </div>
        </div>
      );
    }
  }