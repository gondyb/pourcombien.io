import React from 'react';
import { Link } from 'react-router-dom';

function WinnerComponent(props) {

    const game = props.game;

    switch (game.status) {
        case "PLAYED":
            const firstChoice = game.choices.edges[0].node.numberSelected;
            const secondChoice = game.choices.edges[1].node.numberSelected;

            const mainWinner = firstChoice === secondChoice ? game.firstPlayer : null;

            const reverseButton = <button onClick={props.reverse}>Reverse !</button>;

            return (
                <>
                <p>{game.firstPlayer} a joué {firstChoice}, {game.secondPlayer} a joué {secondChoice}.</p>
                <p>{mainWinner ? mainWinner + " est donc le gagnant !" : "Il n'y a donc pas de gagnant !"}</p>
                <p>{mainWinner === null && props.currentPlayer === 2 ? reverseButton : <Link to="/">Lancer un autre pour combien !</Link>}</p>
                </>
            )
        case "ENDED":
            const thirdChoice = game.choices.edges[2].node.numberSelected;
            const fourthChoice = game.choices.edges[3].node.numberSelected;

            const reverseWinner = thirdChoice === fourthChoice ? game.secondPlayer : null;

            return (
                <>
                <p>{game.firstPlayer} a joué {thirdChoice}, {game.secondPlayer} a joué {fourthChoice}.</p>
                <p>{reverseWinner ? reverseWinner + " est donc le gagnant !" : "Il n'y a donc pas de gagnent !"}</p>
                <p><Link to="/">Lancer un autre pour combien !</Link></p>
                </>
            )
        default:
            return (<p>Pas de gagnant actuellement ...</p>);
    }

}

export default WinnerComponent;