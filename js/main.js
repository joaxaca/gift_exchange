class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}

// TODO: Implement the wishlist feature.

let participants = [
    // Participant Template
    // {
    //     name: "",        -- string
    //     spouse: null,    -- null / string
    //     email: "",       -- string
    //     blacklist: [],   -- array
    //     wishlist: null,  -- null / array
    // },
]

let event = {
    // name: "Robinson's family reunion",   // To implement when saving to DB
    finalized: false,
    pairings: [],
    hat: [],
}

// Get the spouse of a provided participant
function getSpouse(name) {
    const res = participants.filter(participant => participant.name === name)
    return (res.length > 0) ? res[0].spouse : null
}

// See if someone else has defined the provided participant as his/her spouse
function getSpouseOf(name) {
    const res = participants.filter(participant => participant.spouse === name)
    return (res.length > 0) ? res[0].name : null
}

function participantExists(name) {
    const res = participants.filter(participant => participant.name === name)
    return (res.length > 0) ? true : false
}

// Add a new entry to the participants list
function addParticipant(name, spouse, wishlist) {
    
    // The <name> parameter is mandatory
    if(!name) {
        // [11]
        throw new ValidationError("The <name> parameter is mandatory.")
    }

    // Verify that the participant doesn't already exist
    if(participantExists(name)) {
        // [10]
        throw new ValidationError("The participant [" + name + "] already exists.")
    }

    // Is the participant the spouse of someone already in the list?
    const spouseOf = getSpouseOf(name)

    // Was the <spouse> parameter provided?
    if(spouse) {
        
        // Is the spouse, the spouse of someone already in the list?
        const spouseAlreadyTaken = participants.filter(participant => participant.spouse === spouse)
        if(spouseAlreadyTaken.length > 0) {
            // [9]
            throw new ValidationError("The provided <spouse> conflicts with existing data. [9]")
        }

        if(spouseOf) {
            if(spouse != spouseOf) {
                // [6]
                throw new ValidationError("The provided <spouse> conflicts with existing data. [6]")
            }
            else {
                // do noting.
                // [5]
            }
        }
        else {
            const spouseOfSpouse = getSpouse(spouse)
            if(spouseOfSpouse) {
                if(spouse != spouseOfSpouse) {
                    // [8]
                    throw new ValidationError("The provided <spouse> conflicts with existing data. [8]")
                }
                else {
                    // can never be reached.
                }
            }
            else {
                if(participantExists(spouse)) {
                    // [2]
                    participants.forEach(function(participant) {
                        if(participant.name === spouse) {
                            participant.spouse = name
                        }
                    })
                    // throw new ValidationError("The provided <spouse> conflicts with existing data. [2]")                   
                }
                else {
                    // do nothing.
                    // [3]
                }

            }
        }
    }
    else {
        if(spouseOf) {
            // Complete the participant's info.
            // [4]
            spouse = spouseOf
        }
        else {
            // do nothing.
            // [1][7]
        }
    }

    const newParticipant = {
        name: name,
        spouse: spouse,
        blacklist: [],
        wishlist: wishlist,
    }
    
    participants.push(newParticipant)
    return true
}

function generateBlacklists(fullLists) {

    participants.forEach(function(participant) {
        participant.blacklist.push(participant.name)
        if(fullLists && participant.spouse) {
            participant.blacklist.push(participant.spouse)
        }
    })

}

function generatePairings(eventName) {

    if(eventName) {
        event.name = eventName
    }
    else {
        return false
    }

    if(!event.finalized) {
        event.hat = participants.map(participant => participant.name)
        
        // generate the blacklists first
        const fullLists = (participants.length > 3) ? true : false
        generateBlacklists(fullLists)
        
        // Process 1st the most restricted participants
        const restricted = participants.filter(participant => participant.blacklist.length > 1)
        restricted.forEach(function(p) {
            pairUp(p)
        })
    
        // Now process the rest of the participants
        const unrestricted = participants.filter(participant => participant.blacklist.length <= 1)
        unrestricted.forEach(function(p) {
            pairUp(p)
        })
    
        // TODO: Send the pairings via email to all participants.
        // Note: The email property needs to be madatory for this feature to work.

        // mark event as done
        event.finalized = true
        return true
    }

    return false
}

function pairUp(p) {

    // participants not in the blacklist
    const res = participants.filter(participant => participant.blacklist.indexOf(p.name) < 0)
    // participants still in the hat
    const resNames = res.map(participant => participant.name).filter(name => event.hat.indexOf(name) >= 0)
    // get random participant
    const rand = resNames[Math.floor(Math.random() * resNames.length)];
    // create pairing and add it to the list
    const pairing = [p.name, rand]
    event.pairings.push(pairing)
    // remove participant from the hat
    event.hat = event.hat.filter(name => name != rand)
}

function getPairing(name) {

    if(event.finalized) {
        const res = event.pairings.filter(pairing => pairing[0] === name)
        if(res.length > 0) {
            return res[0][1]
        }
    }

    return false
}

// TODO: There's a case that no member of a couple entered their spouse.
// Need a way to define spouse relationship after both members are in the list.
// Only if both member.spouse == null

// Tests
try {
    // -- Test no conflict --
    // addParticipant("jose", null, null)
    // addParticipant("lily", null, null)
    // console.log(participants)
    // participants = []

    // -- Test fixable conflict --
    // addParticipant("jose", null, null)
    // addParticipant("lily", "jose", null)
    // console.log(participants)
    // participants = []

    // -- Test no conflict --
    // addParticipant("jose", null, null)
    // addParticipant("lily", "foo", null)
    // console.log(participants)
    // participants = []

    // -- Test fixable conflict --
    // addParticipant("jose", "lily", null)
    // addParticipant("lily", null, null)
    // console.log(participants)
    // participants = []

    // -- Test no conflict --
    // addParticipant("jose", "lily", null)
    // addParticipant("lily", "jose", null)
    // console.log(participants)
    // participants = []

    // -- Test spouse conflict --
    // addParticipant("jose", "lily", null)
    // addParticipant("lily", "foo", null)
    // console.log(participants)
    // participants = []

    // -- Test no conflict --
    // addParticipant("jose", "foo", null)
    // addParticipant("lily", null, null)
    // console.log(participants)
    // participants = []

    // -- Test spouse conflict --
    // addParticipant("jose", "foo", null)
    // addParticipant("lily", "jose", null)
    // console.log(participants)
    // participants = []

    // -- Test same spouse as another participant --
    // addParticipant("jose", "foo", null)
    // addParticipant("lily", "foo", null)
    // console.log(participants)
    // participants = []

    // -- Test duplicate entries --
    // addParticipant("jose", null, null)
    // addParticipant("jose", "foo", null)
    // console.log(participants)
    // participants = []

    // -- Test empty participant --
    // addParticipant(null, null, null)
    // console.log(participants)
    // participants = []

    // -- Test pairings --
    // addParticipant("jose", null, null)
    // addParticipant("lily", "jose", null)
    // addParticipant("cecilia", null, null)
    // addParticipant("carla", null, null)
    // addParticipant("leo", null, null)
    // addParticipant("masha", "luca", null)
    // addParticipant("luca", "masha", null)
    // addParticipant("vinny", null, null)
    // generatePairings("my event")
    // console.log(event.pairings)

    // -- Test retrieving pairing --
    // console.log("jose ->", getPairing("jose"))

} 
catch(err) {
    if(err instanceof ValidationError) {
        alert("Error: " + err.message)
    }
    else {
        throw err
    }
}

function preventNonAlphaInput(e) {
    if(! /^[a-zA-Z ]+$/.test(e.key)) {
        e.preventDefault();
    }
}

function titleCase(str) {
    return str.toLowerCase().split(' ').map(function(word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}

$(document).ready(function(){

    // Only allow alpha characters
    $('#participantNameAdd, #spouseNameAdd').keypress(function(e) {
        preventNonAlphaInput(e);
        if(e.keyCode==13){
            $('#participantNameAdd').focus()
            $('#btnAddParticipant').click()
        }
    })

    $('#eventName').keypress(function(e) {
        if(participants.length > 3 && $('#eventName').val().length > 0) {
            $('#btnStart').attr('disabled', false)
        }
    })

    $('#participantNamePairing').keypress(function(e) {
        if(e.keyCode==13){
            $('#btnGetPairing').click()
        } 
    })

    // [Get Started] Button
    $('#btnStart').on('click', function() {
        try {
            const eventName = ($('#eventName').val()) ? $('#eventName').val() : null
            if(generatePairings(eventName)) {
                // show successfuly started message

                // enable/disable buttons
                $('#btnAddParticipant').attr('disabled', true)
                $('#btnStart').attr('disabled', true)
                $('#btnGetPairing').attr('disabled', false)

                // enable/disable fields
                $('#eventName').attr('disabled', true)
                $('#participantNameAdd').attr('disabled', true)
                $('#spouseNameAdd').attr('disabled', true)
                $('#participantNamePairing').attr('disabled', false)
            }
            
        }
        catch(err) {
            alert(err.message)
        }
        
    })

    $('#btnAddParticipant').on('click', function() {
        const participant = ($('#participantNameAdd').val()) ? titleCase($('#participantNameAdd').val()) : null
        const spouse = ($('#spouseNameAdd').val()) ? titleCase($('#spouseNameAdd').val()) : null

        try {
            addParticipant(participant, spouse, null)
            const participantCount = participants.length
            $('#participantNameAdd').val("")
            $('#spouseNameAdd').val("")
            // show successfully added message
            // add to list
            $('#participantList').append('<li class="list-group-item" style="padding: 1px 15px">' + participant + '</li>')
            // update badge
            $('#participantCount').text(participantCount)

            // enable [Get Started] if more than 3 participants
            // and has event name
            if(participants.length > 3 && $('#eventName').val().length > 0) {
                $('#btnStart').attr('disabled', false)
            }
        } 
        catch(err) {
            alert(err.message)
        }
    })

    $('#btnGetPairing').on('click', function() {
        const participant = ($('#participantNamePairing').val()) ? titleCase($('#participantNamePairing').val()) : null

        if(participant) {
            $('#lblPairing').text("Your pairing is: " + getPairing(participant))
        }
        
    })
    
  
})