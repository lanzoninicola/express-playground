const d = document;

const root = d.querySelectorAll("#root");

const createNode = (element) => d.createElement(element);
const append = (parent, el) => parent.appendChild(el);

const createList = (data) => {
  const ul = createNode("ul");
  data.forEach((item) => {
    const li = createNode("li");
    li.innerHTML = `
      <h3>(${item.id}) ${item.name}</h3>
      <h4>I'm an ${item.profession}</h4>
      <p>${item.shortBio}</p>
      `;
    append(ul, li);
  });
  append(root[0], ul);
};

export default createList;
