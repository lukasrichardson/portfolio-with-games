import React, { Component } from 'react';
class JoinModal extends Component{
    render(){
        return(
            <div id="input-box" style={{display: 'none'}}>
                <h4>Choose Your Username</h4>
                <input type="text" name="username" placeholder="User Name"/><br/>
                <h4>Type a Room Number</h4>
                <input type="number" name="roomNumber" placeholder="Room Number"/><br/>
                <select>
                    <option>test</option>
                </select>
                <button type="submit">Submit</button>
            </div>
        )
    }
}

export default JoinModal;