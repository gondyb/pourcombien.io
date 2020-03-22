import React from 'react';

function PlayComponent(props) {

    const game = props.game;

    let buttons = [];

    const howMany = game.status === "REVERSED" ? game.howMany : game.howMany + 1;

    for (let index = 1; index < howMany; index++) {
        buttons.push(
            <button onClick={props.chooseNumber} key={"button"+index}>{index}</button>
        )
    }

    return buttons;
}

export default PlayComponent;