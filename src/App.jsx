import React, { useEffect, useState } from "react";
import axios from "axios";
import * as d3 from "d3";
import "./App.css";

const TreeVisualization = () => {
  const [treeData, setTreeData] = useState([]);
  const [searchPath, setSearchPath] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    try {
      const response = await axios.get("http://10.4.3.155:1488/tree");
      setTreeData(response.data.tree);
      drawTree(response.data.tree);
    } catch (error) {
      console.error("Ошибка загрузки дерева", error);
    }
  };

  const handleSearch = async () => {
    if (!searchValue) return;
    try {
      const response = await axios.post("http://10.4.3.155:1488/tree/search", { value: Number(searchValue) });
      setSearchPath(response.data.searchPath);
      animateSearch(response.data.searchPath);
    } catch (error) {
      console.error("Ошибка поиска", error);
    }
  };

  const drawTree = (nodes) => {
    d3.select("#tree").selectAll("*").remove();

    const width = 600, height = 500, marginTop = 50, rootOffset = 50;

    const svg = d3.select("#tree").append("svg").attr("width", width).attr("height", height);
    const treeStructure = d3.tree().size([width - 100, height - 150]);

    const hierarchyData = d3.stratify()
      .id(d => d.value.toString())
      .parentId(d => (d.parent ? d.parent.toString() : null))(nodes);

    const treeData = treeStructure(hierarchyData);
    const linkGenerator = d3.linkVertical().x(d => d.x).y(d => d.y + marginTop + rootOffset);

    svg.append("g").attr("transform", `translate(50, ${marginTop})`)
      .selectAll(".link").data(treeData.links()).enter().append("path")
      .attr("d", linkGenerator).attr("stroke", "black").attr("fill", "none");

    const nodesGroup = svg.append("g").attr("transform", `translate(50, ${marginTop + rootOffset})`)
      .selectAll(".node").data(treeData.descendants()).enter().append("g").attr("class", "node");

    nodesGroup.append("circle").attr("cx", d => d.x).attr("cy", d => d.y).attr("r", 20)
      .attr("fill", d => d.data.color).attr("id", d => `node-${d.data.value}`);

    nodesGroup.append("text").attr("x", d => d.x).attr("y", d => d.y + 5)
      .attr("text-anchor", "middle").attr("fill", "white").attr("font-size", "14px")
      .attr("font-weight", "bold").text(d => d.data.value);
  };

  const animateSearch = (path) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index > 0) d3.select(`#node-${path[index - 1]}`).attr("fill", "black");
      if (index < path.length) {
        d3.select(`#node-${path[index]}`).attr("fill", "red");
        index++;
      } else clearInterval(interval);
    }, 1000);
  };

  return (
    <div>
      <h2>Красно-чёрное дерево</h2>
      <div>
        <input type="number" value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Введите значение" />
        <button onClick={handleSearch}>Найти</button>
      </div>
      <div id="tree"></div>
    </div>
  );
};

export default TreeVisualization;


// import React, { useEffect, useState } from "react";
// import * as d3 from "d3";
// import "./App.css";

// const TreeVisualization = () => {
//   const [treeData, setTreeData] = useState([]);
//   const [searchPath, setSearchPath] = useState([]);
//   const [searchValue, setSearchValue] = useState("");

//   useEffect(() => {
//     const mockTreeData = [
//       { value: 50, color: "black", parent: null },
//       { value: 30, color: "red", parent: 50 },
//       { value: 70, color: "black", parent: 50 },
//       { value: 20, color: "black", parent: 30 },
//       { value: 40, color: "black", parent: 30 },
//       { value: 10, color: "red", parent: 20 },
//       { value: 25, color: "red", parent: 20 },
//       { value: 35, color: "red", parent: 40 },
//       { value: 45, color: "red", parent: 40 },
//       { value: 5, color: "black", parent: 10 },
//       { value: 15, color: "black", parent: 10 },
//       { value: 22, color: "black", parent: 25 },
//       { value: 28, color: "black", parent: 25 },
//       { value: 33, color: "black", parent: 35 },
//       { value: 38, color: "black", parent: 35 },
//       { value: 60, color: "red", parent: 70 },
//       { value: 80, color: "red", parent: 70 },
//       { value: 55, color: "black", parent: 60 },
//       { value: 65, color: "black", parent: 60 },
//       { value: 75, color: "black", parent: 80 },
//       { value: 85, color: "black", parent: 80 },
//       { value: 52, color: "red", parent: 55 },
//       { value: 58, color: "red", parent: 55 },
//       { value: 63, color: "red", parent: 65 }
//     ];

//     const enhancedTree = addNullNodes(mockTreeData);
//     setTreeData(enhancedTree);
//     drawTree(enhancedTree);
//   }, []);

//   const addNullNodes = (nodes) => {
//     const nodesWithNulls = [...nodes];
//     nodes.forEach((node) => {
//       const hasLeft = nodes.some((n) => n.parent === node.value && n.value < node.value);
//       const hasRight = nodes.some((n) => n.parent === node.value && n.value > node.value);
//       if (!hasLeft) nodesWithNulls.push({ value: `N${node.value}L`, color: "gray", parent: node.value });
//       if (!hasRight) nodesWithNulls.push({ value: `N${node.value}R`, color: "gray", parent: node.value });
//     });
//     return nodesWithNulls;
//   };

//   const drawTree = (nodes) => {
//     d3.select("#tree").selectAll("*").remove();
//     const width = window.innerWidth * 0.9, height = window.innerHeight * 0.8, marginTop = 50;

//     const svg = d3.select("#tree").append("svg").attr("width", width).attr("height", height);
//     const treeStructure = d3.tree().size([width - 100, height - 150]);

//     const hierarchyData = d3.stratify().id(d => d.value).parentId(d => (d.parent ? d.parent.toString() : null))(nodes);
//     const treeData = treeStructure(hierarchyData);
//     const linkGenerator = d3.linkVertical().x(d => d.x).y(d => d.y + marginTop);

//     svg.append("g").attr("transform", `translate(50, ${marginTop})`)
//       .selectAll(".link").data(treeData.links()).enter().append("path")
//       .attr("d", linkGenerator).attr("stroke", "black").attr("fill", "none");

//     const nodesGroup = svg.append("g").attr("transform", `translate(50, ${marginTop})`)
//       .selectAll(".node").data(treeData.descendants()).enter().append("g").attr("class", "node");

//     nodesGroup.append("circle").attr("cx", d => d.x).attr("cy", d => d.y).attr("r", 20)
//       .attr("fill", d => d.data.color).attr("id", d => `node-${d.data.value}`);

//     nodesGroup.append("text").attr("x", d => d.x).attr("y", d => d.y + 5)
//       .attr("text-anchor", "middle").attr("fill", "white").attr("font-size", "14px")
//       .attr("font-weight", "bold").text(d => String(d.data.value).startsWith("N") ? "nil" : d.data.value);

//   };

//   const handleSearch = () => {
//     if (!searchValue) return;
//     const mockResponse = { searchPath: [50, 30, 40, 35, Number(searchValue)] };
//     setSearchPath(mockResponse.searchPath);
//     animateSearch(mockResponse.searchPath);
//   };

//   const animateSearch = (path) => {
//     let index = 0;
//     const originalColors = {};
  
//     // Сохраняем исходные цвета узлов
//     path.forEach(value => {
//       originalColors[value] = d3.select(`#node-${value}`).attr("fill");
//     });
  
//     const interval = setInterval(() => {
//       if (index > 0) {
//         const prevNode = path[index - 1];
//         d3.select(`#node-${prevNode}`).attr("fill", originalColors[prevNode]); // Восстанавливаем цвет
//       }
  
//       if (index < path.length - 1) {
//         d3.select(`#node-${path[index]}`).attr("fill", "orange"); // Подсветка текущего узла
//       } else {
//         d3.select(`#node-${path[index]}`).attr("fill", "lightblue"); // Оставляем последний узел голубым
//         clearInterval(interval);
//       }
      
//       index++;
//     }, 1000);
//   };  

//   return (
//     <div>
//       <h2>Красно-чёрное дерево</h2>
//       <div>
//         <input type="number" value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
//           placeholder="Введите значение" />
//         <button onClick={handleSearch}>Найти</button>
//       </div>
//       <div id="tree"></div>
//     </div>
//   );
// };

// export default TreeVisualization;
