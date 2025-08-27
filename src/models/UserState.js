class UserState {
    constructor(state, waitingFor = null, description = null, backgroundColor = null, gender = null, image1 = null) {
        this.state = state;
        this.waitingFor = waitingFor;
        this.description = description;
        this.backgroundColor = backgroundColor;
        this.gender = gender;
        this.image1 = image1;
    }
}

module.exports = UserState;
