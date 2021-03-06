import { createElement } from '../helpers/domHelper';

export function createFighterPreview(fighter, position) {

  const positionClassName = position === 'right' ? 'fighter-preview___right' : 'fighter-preview___left';
  const fighterElement = createElement({
    tagName: 'div',
    className: `fighter-preview___root ${positionClassName}`
  });
  if (fighter) {
    const { name, source, health, attack, defense } = fighter;
    const attributes = {
      src: source,
      title: name,
      alt: name,
    };
    const imgElement = createElement({
      tagName: 'img',
      className: `fighter___fighter-image`,
      attributes
    });
    const fighterName = createElement({ tagName: 'span', className: 'arena___fighter-name' });
    const fighterHealth = createElement({ tagName: 'span', className: 'arena___fighter-name' });
    const fighterAttack = createElement({ tagName: 'span', className: 'arena___fighter-name' });
    const fighterDefense = createElement({ tagName: 'span', className: 'arena___fighter-name' });
    fighterName.innerText = name;
    fighterHealth.innerText = 'health:' + health;
    fighterAttack.innerText = 'attack:' + attack;
    fighterDefense.innerText = 'defense:' + defense;
    fighterElement.append(fighterName,imgElement,fighterHealth,fighterAttack,fighterDefense);
  }
  // todo: show fighter info (image, name, health, etc.)

  return fighterElement;
}

export function createFighterImage(fighter) {
  const { source, name } = fighter;
  const attributes = {
    src: source,
    title: name,
    alt: name
  };
  const imgElement = createElement({
    tagName: 'img',
    className: 'fighter-preview___img',
    attributes
  });

  return imgElement;
}
