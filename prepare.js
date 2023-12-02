const fs = require("fs");

const template = fs.readFileSync("./index.html.template", "utf8");

const data = {
  sections: [],
};

// loop through each directory in the ./reports folder
fs.readdirSync("./reports").forEach((dir) => {
  // check if the directory is a directory
  if (fs.lstatSync(`./reports/${dir}`).isDirectory()) {
    const section = {
      title: dir.replace(/_/g, " "),
      reports: [],
    };

    // loop through each file in the directory
    fs.readdirSync(`./reports/${dir}`).forEach((subdir) => {
      if (!fs.lstatSync(`./reports/${dir}/${subdir}`).isDirectory()) return;
      // read the org file
      const report = fs.readFileSync(
        `./reports/${dir}/${subdir}/${subdir}.org`,
        "utf8"
      );
      const title = report.match(/(?:#\+title: )([A-z\ ]+)/g)[0].substring(9);
      const subtitle = report
        .match(/(?:#\+subtitle: )([A-z\ ]+)/g)[0]
        .substring(12);
      const link = `reports/${dir}/${subdir}/${subdir}.pdf`;

      // add the report to the section
      section.reports.push({
        title,
        subtitle,
        link,
      });
    });

    // add the section to the data
    data.sections.push(section);
  }
});

// render the template
const Handlebars = require("handlebars");
const templateFn = Handlebars.compile(template);
const result = templateFn(data);

// write the result to the index.html file
fs.writeFileSync("./index.html", result);
