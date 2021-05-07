import { createElement } from '../../helpers/domHelper';
import App from '../../app';

export function showModal({ title, bodyElement, onClose = () => {} }) {

  const root = getModalContainer();
  const modal = createModal({ title, bodyElement, onClose }); 
  
  root.append(modal);
}

function getModalContainer() {
  return document.getElementById('root');
}

function createModal({ title, bodyElement, onClose }) {
  const layer = createElement({ tagName: 'div', className: 'modal-layer' });
  const modalContainer = createElement({ tagName: 'div', className: 'modal-root' });
  const header = createHeader(title, onClose);

  modalContainer.append(header, bodyElement);
  layer.append(modalContainer);

  return layer;
}

function createHeader(title, onClose) {
  const headerElement = createElement({ tagName: 'div', className: 'modal-header' });
  const titleElement = createElement({ tagName: 'span' });
  const closeButton = createElement({ tagName: 'div', className: 'close-btn' });
  
  titleElement.innerText = title;
  closeButton.innerText = '×';
  
  const close = () => {
    hideModal();
    onClose();
    const doc = document.getElementsByClassName("arena___root")[0];
    doc.remove();//очищаем документ перед следующим боем
    new App();//генерируем следующий бой
  }
  closeButton.addEventListener('click', close);
  headerElement.append(titleElement, closeButton);
  
  return headerElement;
}

function hideModal() {
  const modal = document.getElementsByClassName('modal-layer')[0];
  modal?.remove();
}
