import { controls } from '../../constants/controls';

export async function fight(firstFighter, secondFighter) {

  firstFighter.variableHealth = firstFighter.health;
  secondFighter.variableHealth = secondFighter.health;
  firstFighter.isActiveCrit = true;
  secondFighter.isActiveCrit = true;
  const fightLogElement = document.querySelector('.arena___fight-log');
  fightLogElement.setAttribute('readonly', '');

  return new Promise((resolve) => {//промис который возвращает победителя
    let combinationFirstFighter = new Set();
    let combinationSecondFighter = new Set();
    let timerIdFirst;
    let timerIdSecond;
    let attacker;
    let defender;

    //--------------------логика для критов ----------------------------------------
    function criticalKickTimer(ms, fighter, timerId) { //функция которая позволяе бить крит
      timerId = setTimeout(() => {
        fighter.isActiveCrit = true;
        clearTimeout(timerId);
      }, ms);
    }

    function criticalKickPower(fighter1, fighter2) {
      fighter2.variableHealth = fighter2.variableHealth - fighter1.attack * 2;//проводим крит
      const oldText = fightLogElement.value;
      const newText = fighter1.name + ' hit CRIT: ' + fighter1.attack * 2 + ' pts!!!';
      fightLogElement.value = oldText + '\n' + newText;
      fightLogElement.scrollTop = fightLogElement.scrollHeight;
    }

    //-----------логика для обычных ударов ------------------------

    const checkingFighter = (fighter1, fighter2) => {
      if (!fighter1.blockPower) {  //если не в блоке первый боец, то он атакует
        attacker = fighter1;
        const hitPower = getHitPower(attacker);
        let damage
        if (fighter2.blockPower) { //есть ли у второго бойца блок, если да то урон уменьшается
          damage = hitPower - fighter2.blockPower;
          if (damage < 0) damage = 0; // если сила блока больше силы удара, то урон ноль
          fighter2.variableHealth = fighter2.variableHealth - damage;
          fighter2.blockPower = 0;
        } else {
          damage = hitPower;
          fighter2.variableHealth = fighter2.variableHealth - damage;
        }
        const oldText = fightLogElement.value;
        const newText = fighter1.name + ' amazing hit ' + (Math.round(damage * 100) / 100) + ' pts!';
        fightLogElement.value = oldText + '\n' + newText;
        fightLogElement.scrollTop = fightLogElement.scrollHeight;
        return fighter2.variableHealth;
      }
    };

    function keyDownListener(event) {//главный листенер нажатия клавиш

      //-----------логика для критов для первого бойца--------------------------------
      if (event.code === controls.PlayerOneCriticalHitCombination[0] ||
        event.code === controls.PlayerOneCriticalHitCombination[1] ||
        event.code === controls.PlayerOneCriticalHitCombination[2]) {
        combinationFirstFighter.add(event.code);
      }

      if (combinationFirstFighter.size === 3) { //проверям нажаты ли все 3 клавиши для критического удара
        if (firstFighter.isActiveCrit) {//проверяем прошло ли время для очередного крита
          criticalKickTimer(10000,firstFighter,timerIdFirst)
          attacker = firstFighter;
          defender = secondFighter;
          criticalKickPower(attacker, defender);
          firstFighter.isActiveCrit = false; //запрещаем крит пока не пройдет заданное время
        }
      }
      //-----------логика для критов для второго бойца--------------------------------
      if (event.code === controls.PlayerTwoCriticalHitCombination[0] ||
        event.code === controls.PlayerTwoCriticalHitCombination[1] ||
        event.code === controls.PlayerTwoCriticalHitCombination[2]) {
        combinationSecondFighter.add(event.code);
      }
      if (combinationSecondFighter.size === 3) { //проверям нажаты ли все 3 клавиши для критического удара
        if (secondFighter.isActiveCrit) {//проверяем прошло ли время для очередного крита
          criticalKickTimer(10000,secondFighter,timerIdSecond)
          attacker = secondFighter;
          defender = firstFighter;
          criticalKickPower(attacker, defender);
          secondFighter.isActiveCrit = false; //запрещаем крит пока не пройдет заданное время
        }
      }
      console.log("firstFighter.isActiveCrit:  " + firstFighter.isActiveCrit)
      console.log("secondFighter.isActiveCrit:  " + secondFighter.isActiveCrit)
      //-----------логика обычных ударов и защиты первого бойца--------------------------------
      if (event.code === controls.PlayerOneAttack) {
        checkingFighter(firstFighter, secondFighter);
      }

      if (event.code === controls.PlayerOneBlock) {
        defender = firstFighter;
        firstFighter.blockPower = getBlockPower(defender);
      }

      //-----------логика обычных ударов и защиты второго бойца--------------------------------
      if (event.code === controls.PlayerTwoAttack) {
        checkingFighter(secondFighter, firstFighter);
      }

      if (event.code === controls.PlayerTwoBlock) {
        defender = secondFighter;
        secondFighter.blockPower = getBlockPower(defender);
      }

      //-----------------------------------------------------------------------------------------

      if (firstFighter.blockPower && secondFighter.blockPower) {  //проверка не в блоке ли оба бойца, если да снимаем блок обоим
        firstFighter.blockPower = 0;
        secondFighter.blockPower = 0;
      }

      let firstFighterBar = document.getElementById('left-fighter-indicator');
      let secondFighterBar = document.getElementById('right-fighter-indicator');
      firstFighterBar.style.width = firstFighter.variableHealth > 0 ? firstFighter.variableHealth / firstFighter.health * 100 + '%' : 0;
      secondFighterBar.style.width = secondFighter.variableHealth > 0 ? secondFighter.variableHealth / secondFighter.health * 100 + '%' : 0;

      if (firstFighter.variableHealth < 0) {
        document.removeEventListener('keydown', keyDownListener);
        document.removeEventListener('keyup', keyUpListener);
        resolve(secondFighter);
      }
      if (secondFighter.variableHealth < 0) {
        document.removeEventListener('keydown', keyDownListener);
        document.removeEventListener('keyup', keyUpListener);
        resolve(firstFighter);
      }
    }

    function keyUpListener(event) { //листенер чтобы отслеживать нажаты ли все одновременно 3 кнопки для крита
      combinationFirstFighter.delete(event.code);//если какая-то не нажата удаляем её из массива и тогда не выполнится условие
      combinationSecondFighter.delete(event.code);
    }

    document.addEventListener('keydown', keyDownListener);
    document.addEventListener('keyup', keyUpListener);

  })
}

export function getDamage(attacker, defender) {
  let damage = getHitPower(attacker) - getBlockPower(defender);
  if (damage < 0) {
    damage = 0;
  }
  return damage;
  // return damage
}

export function getHitPower(fighter) {
  let criticalHitChance = Math.random() + 1;
  let hitPower = fighter.attack * criticalHitChance;
  return hitPower;
  // return hit power
}

export function getBlockPower(fighter) {
  let dodgeChance = Math.random() + 1;
  let blockPower = fighter.defense * dodgeChance;
  return blockPower;
  // return block power
}
