import React, { useState } from 'react';

function JoinGameForm(props) {
    const game = props.game;

    const [secondPlayer, setSecondPlayer] = useState("Dupont");

    const [howMany, setHowMany] = useState(5);

    const handleJoinGameForm = (e) => {
        e.preventDefault();

        props.joinGame({
            variables: {
                id: game.id,
                secondPlayer: secondPlayer,
                howMany: howMany
            }
        });
    };

    return(
        <div>
            <p>{game.firstPlayer} te challenge au pour combien !</p>
            <p>Pour combien {game.question}</p>
            <form onSubmit={handleJoinGameForm}>
                <div>
                    <label>Ton nom :</label>
                    <br />
                    <input type="text" value={secondPlayer} onChange={e => setSecondPlayer(e.target.value)} />
                </div>

                <div>
                    <label>Pour ... </label>
                    <br></br>
                    <input type="number" value={howMany} onChange={e => setHowMany(e.target.value)} />
                </div>

                <input type="submit" value="Envoyer" />
            </form>
        </div>
    );
}

export default JoinGameForm;