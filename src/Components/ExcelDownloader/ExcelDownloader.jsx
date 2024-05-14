import React, { useState, useEffect } from "react";
import ExcelJS from 'exceljs/dist/exceljs.min.js';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import "react-datepicker/dist/react-datepicker.css";
import { MdCheckCircle } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import { MdDelete } from "react-icons/md";

function ExcelDownloader({ data, fileName, usuario, registro, month, price}) {
  const navigate = useNavigate();

    useEffect(() => {
      const checkAuthentication = async () => {
        const accessToken = await AsyncStorage.getItem("accessToken");
        const role = jwtDecode(accessToken).user.role;
        if (!accessToken || role != "master") {
          navigate("/");
        }
      };
  
      checkAuthentication();
    }, []);


  const handleDownload = async () => {
    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');


    console.log(data)
    console.log(month)

    const userId = usuario._id


    const response = await axios.get(`https://unimentor-fqz8.onrender.com/api/v1/hourlog/monitormonthsemester/${userId}?month=${month}`);

    console.log(response.data)
    // Agregar encabezados
    // worksheet.addRow(['Nombre', 'Edad']);

    // Agregar datos
    // usuario.forEach(({ fullname, email }) => {
    //   worksheet.addRow([usuario.fullname, usuario.email]);
    // });
    worksheet.addRow(["NOMBRE COMPLETO MONITOR", usuario.fullname]);
    worksheet.addRow(["C.C", usuario.documentNumber]);
    worksheet.addRow(["Email UAM", usuario.email]);
    worksheet.addRow([]);
    // worksheet.mergeCells('A4:E4');
    worksheet.addRow(["Asignatura", "Fecha de la Clase", "Docente a Cargo", "Programa y Grupo", "Cantidad de Horas"]);
    response.data.hoursLog.forEach(({ subject, date, teacher, program, group, hours  }) => {
      worksheet.addRow([subject[0].name, date.slice(0, 10), teacher[0].fullname, `${program[0].name} - ${group[0].name}`, hours]);
    });
    worksheet.addRow([]);
    worksheet.addRow(["Total Horas", response.data.sum[0].totalHours]);
    worksheet.addRow([]);
    worksheet.addRow(["Total a Pagar", price*response.data.sum[0].totalHours]);
    // worksheet.addRow(["Total a Pagar", price*response.data.sum[0].totalHours]);

    // worksheet.addRow(["Mes"]);
    // worksheet.addRow([usuario.fullname]).getCell('C').alignment = { vertical: 'middle', horizontal: 'center' };

    // Aplicar estilos
    // worksheet.eachRow((row) => {
    //   row.eachCell((cell) => {
    //     cell.border = { top: { style: 'thin' }/* , bottom: { style: 'thin' } */, left: { style: 'thin' }, right: { style: 'thin' } };
    //     cell.font = { size: 12 };
    //     if (cell.address === 'B2') {
    //       cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } }; // Color de fondo para B2
    //     }
    //     if (cell.address === 'A1') {
    //       cell.font = { color: { argb: 'FF0000' } }; // Color de texto para A1
    //     }
    //   });
    // });

    // Combinar celdas (por ejemplo, de C1 a Y1)
    // worksheet.mergeCells('C1:Y4');

    // Guardar el libro de Excel como un archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <button onClick={handleDownload}>Descargar Excel</button>
  );
}

export default ExcelDownloader;
