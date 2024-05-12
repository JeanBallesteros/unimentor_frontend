import React from 'react';
import ExcelJS from 'exceljs/dist/exceljs.min.js';

function ExcelDownloader({ data, fileName }) {
  const handleDownload = async () => {
    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Agregar encabezados
    worksheet.addRow(['Nombre', 'Edad']);

    // Agregar datos
    data.forEach(({ name, age }) => {
      worksheet.addRow([name, age]);
    });

    // Aplicar estilos
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = { top: { style: 'thin' }/* , bottom: { style: 'thin' } */, left: { style: 'thin' }, right: { style: 'thin' } };
        cell.font = { size: 12 };
        if (cell.address === 'B2') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } }; // Color de fondo para B2
        }
        if (cell.address === 'A1') {
          cell.font = { color: { argb: 'FF0000' } }; // Color de texto para A1
        }
      });
    });

    // Combinar celdas (por ejemplo, de C1 a Y1)
    worksheet.mergeCells('C1:Y4');

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
