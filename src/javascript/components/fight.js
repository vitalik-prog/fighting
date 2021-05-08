import { controls } from '../../constants/controls';
import { showWinnerModal } from './modal/winner';

export async function fight(firstFighter, secondFighter) {

  firstFighter.variableHealth = firstFighter.health;
  secondFighter.variableHealth = secondFighter.health;
  firstFighter.isActiveCrit = true;
  secondFighter.isActiveCrit = true;

  return new Promise((resolve) => {//промис который возвращает победителя
    let combinationFirstFighter = new Set();
    let combinationSecondFighter = new Set();
    let timerId;

    function keyDownListener(event) {//главный листенер нажатия клавиш

      //--------------------логика для критов ----------------------------------------
      function criticalKick(ms, fighter) { //функция которая позволяе бить крит
        timerId = setInterval(() => {
          fighter.isActiveCrit = true;
          clearInterval(timerId);
        }, ms);
      }

      //-----------логика для критов для первого бойца--------------------------------
      if (event.code === controls.PlayerOneCriticalHitCombination[0] ||
        event.code === controls.PlayerOneCriticalHitCombination[1] ||
        event.code === controls.PlayerOneCriticalHitCombination[2]) {
        combinationFirstFighter.add(event.code);
      }

      if (combinationFirstFighter.size === 3) { //проверям нажаты ли все 3 клавиши для критического удара
        criticalKick(4000, firstFighter);
        if (firstFighter.isActiveCrit) {//проверяем прошло ли время для очередного крита
          secondFighter.variableHealth = secondFighter.variableHealth - firstFighter.attack * 2;//проводим крит
        }
        firstFighter.isActiveCrit = false; //запрещаем крит пока не пройдет заданное время
      }
      console.log('secondFighter.isActiveCrit' + firstFighter.isActiveCrit);
      //-----------логика для критов для второго бойца--------------------------------
      if (event.code === controls.PlayerTwoCriticalHitCombination[0] ||
        event.code === controls.PlayerTwoCriticalHitCombination[1] ||
        event.code === controls.PlayerTwoCriticalHitCombination[2]) {
        combinationSecondFighter.add(event.code);
      }
      if (combinationSecondFighter.size === 3) { //проверям нажаты ли все 3 клавиши для критического удара
        criticalKick(4000, secondFighter);
        if (secondFighter.isActiveCrit) {//проверяем прошло ли время для очередного крита
          firstFighter.variableHealth = firstFighter.variableHealth - secondFighter.attack * 2;//проводим крит
        }
        secondFighter.isActiveCrit = false; //запрещаем крит пока не пройдет заданное время
      }
      console.log("secondFighter.isActiveCrit" + secondFighter.isActiveCrit);
      //-----------логика для обычных ударов ------------------------
      let attacker;
      let defender;

      const checkingFighter = (fighter1, fighter2) => {
        if (!fighter1.blockPower) {  //если не в блоке первый боец, то он атакует
          attacker = fighter1;
          if (fighter2.blockPower) { //есть ли у второго бойца блок, если да то урон уменьшается
            let damage = fighter2.blockPower - getHitPower(attacker);
            if (damage > 0) damage = 0; // если сила блока больше силы удара, то урон ноль
            fighter2.variableHealth = fighter2.variableHealth + damage;
            fighter2.blockPower = 0;
          } else {
            fighter2.variableHealth = fighter2.variableHealth - getHitPower(attacker);
          }
          return fighter2.variableHealth;
        }
      };

      if (event.code === controls.PlayerOneBlock) {
        defender = firstFighter;
        firstFighter.blockPower = getBlockPower(defender);
      }

      if (event.code === controls.PlayerTwoBlock) {
        defender = secondFighter;
        secondFighter.blockPower = getBlockPower(defender);
      }

      if (event.code === controls.PlayerOneAttack) {
        checkingFighter(firstFighter, secondFighter);
      }

      if (event.code === controls.PlayerTwoAttack) {
        checkingFighter(secondFighter, firstFighter);
      }

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
        clearInterval(timerId);
        resolve(secondFighter);
      }
      if (secondFighter.variableHealth < 0) {
        document.removeEventListener('keydown', keyDownListener);
        document.removeEventListener('keyup', keyUpListener);
        clearInterval(timerId);
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
    .then(fighter => showWinnerModal(fighter));
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
