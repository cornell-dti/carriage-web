import React from "react";
import ReactDOM from "react-dom";
import "./google.css";
import "./style.css";
import Google from "./Google";
//import { throwStatement } from "@babel/types";

class SectionA extends React.Component {
  render() {
    const sectionA = (
      <section id="section-a">
        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nobis unde
          aliquid nisi excepturi, et quam. Maiores ut cupiditate officia
          consectetur! Ab ullam dolores quia illum quisquam eaque voluptatum,
          minus earum laboriosam iste neque eveniet vel voluptates hic a veniam
          velit accusamus voluptate similique expedita reprehenderit laudantium
          laborum possimus inventore. Perferendis veniam laboriosam quam
          corporis facere, consequuntur in ullam numquam natus, impedit minima
          ducimus, repellendus blanditiis adipisci! Sit laboriosam ea id enim
          quaerat doloribus distinctio asperiores iure maiores? Ducimus laborum
          incidunt voluptatem veniam aut recusandae culpa commodi voluptatibus
          est quam, delectus deserunt voluptates d ignissimos necessitatibus
          modi placeat doloribus nemo ratione vel.
        </p>
      </section>
    );

    return sectionA;
  }
}

class Header extends React.Component {
  render() {
    const header = (
      <header id="showcase">
        <h1>Welcome to Carriage</h1>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias minus
          recusandae enim placeat, maiores atque!
        </p>
        <a href="#" className="button">
          {" "}
          Read More
        </a>
      </header>
    );

    return header;
  }
}

class Page extends React.Component {
  render() {
    const page = (
      <div>
        <div>
          <Header />
        </div>
        <div>
          <SectionA />
        </div>
        <div>
          <Google />
        </div>
      </div>
    );

    return page;
  }
}

ReactDOM.render(<Page />, document.getElementById("root"));
