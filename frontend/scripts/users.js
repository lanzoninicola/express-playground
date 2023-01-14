import createList from "./app.mjs";

const getData = async () => {
  const response = await fetch("http://localhost:3000/api/users", {
    foo: "bar",
  });
  const data = await response.json();

  createList(data);
};

getData();
