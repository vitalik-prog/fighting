import { controls } from '../../constants/controls';

export async function fight(firstFighter, secondFighter) {

  firstFighter.variableHealth = firstFighter.health;
  secondFighter.variableHealth = secondFighter.health;
  firstFighter.isActiveCrit = true;
  secondFighter.isActiveCrit = true;
  const fightLogElement = document.querySelector('.arena___fight-log');
  fightLogElement.setAttribute('readonly', '');

  return new Promise((resolve) => {//промис который возвращает победителя
    let CritKeysFirstFighter = new Set();
    let CritKeysSecondFighter = new Set();
    let DefenseKeyFirstFighter = new Set();
    let DefenseKeySecondFighter = new Set();
    let timerIdFirst;
    let timerIdSecond;
    let attacker;
    let defender;

    //--------------------логика для критов ----------------------------------------
    function criticalKickTimer(ms, fighter, timerId) { //функция которая отсчитывает время для крита
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

    const calculationDamage = (fighter1, fighter2, blockPower) => {
      attacker = fighter1;
      const hitPower = getHitPower(attacker);
      let damage;
      if (blockPower) { //есть ли у второго бойца блок, если да то урон уменьшается
        damage = hitPower - blockPower;
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

    };

    function keyDownListener(event) {//главный листенер нажатия клавиш
      //-----------логика для критов для первого бойца--------------------------------
      if (event.code === controls.PlayerOneCriticalHitCombination[0] ||
        event.code === controls.PlayerOneCriticalHitCombination[1] ||
        event.code === controls.PlayerOneCriticalHitCombination[2]) {
        CritKeysFirstFighter.add(event.code);
      }

      if (CritKeysFirstFighter.size === 3) { //проверям нажаты ли все 3 клавиши для критического удара
        if (firstFighter.isActiveCrit) {//проверяем прошло ли время для очередного крита
          criticalKickTimer(10000, firstFighter, timerIdFirst);
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
        CritKeysSecondFighter.add(event.code);
      }
      if (CritKeysSecondFighter.size === 3) { //проверям нажаты ли все 3 клавиши для критического удара
        if (secondFighter.isActiveCrit) {//проверяем прошло ли время для очередного крита
          criticalKickTimer(10000, secondFighter, timerIdSecond);
          attacker = secondFighter;
          defender = firstFighter;
          criticalKickPower(attacker, defender);
          secondFighter.isActiveCrit = false; //запрещаем крит пока не пройдет заданное время
        }
      }
      //-----------логика обычных ударов и защиты первого бойца--------------------------------
      if (event.code === controls.PlayerOneAttack) {
        if (DefenseKeyFirstFighter.size === 1) {
          return;
        } else {
          if (DefenseKeySecondFighter.size === 1) {
            defender = secondFighter;
            secondFighter.blockPower = getBlockPower(defender);
            calculationDamage(firstFighter, secondFighter, secondFighter.blockPower);
          } else {
            calculationDamage(firstFighter, secondFighter, null);
          }
        }
      }

      if (event.code === controls.PlayerOneBlock) {
        DefenseKeyFirstFighter.add(event.code);
      }

      //-----------логика обычных ударов и защиты второго бойца--------------------------------
      if (event.code === controls.PlayerTwoAttack) {
        if (DefenseKeySecondFighter.size === 1) {//проверяем если у атакующего бойца удерживается клавиша блока он не может бить
          return;
        } else { // если не удерживается клавиша блока, то он может бить и идет дальше логика для удара
          if (DefenseKeyFirstFighter.size === 1) {//проверяем есть ли у защищающегося бойца блок если да, то удар "смягчается"
            defender = firstFighter;
            firstFighter.blockPower = getBlockPower(defender);
            calculationDamage(secondFighter, firstFighter, firstFighter.blockPower);
          } else {//если у защищающегося блока нет, то удар идет по полной
            calculationDamage(secondFighter, firstFighter, null);
          }
        }
      }

      if (event.code === controls.PlayerTwoBlock) {
        DefenseKeySecondFighter.add(event.code);
      }

      //-----------------------------------------------------------------------------------------

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
      CritKeysFirstFighter.delete(event.code);//если какая-то не нажата удаляем её из массива и тогда не выполнится условие
      CritKeysSecondFighter.delete(event.code);
      DefenseKeyFirstFighter.delete(event.code);
      DefenseKeySecondFighter.delete(event.code);
    }

    document.addEventListener('keydown', keyDownListener);
    document.addEventListener('keyup', keyUpListener);

  });
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
