import { showModal } from './modal';
import { createElement } from '../../helpers/domHelper';

export function showWinnerModal(fighter) {

  const { name, source} = fighter;
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
  let title = "Winner:" + name
  let bodyElement = imgElement
  showModal({title,bodyElement})
  // call showModal function
}
