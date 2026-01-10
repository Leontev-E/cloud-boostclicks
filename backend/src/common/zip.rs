use std::io::Write;

use zip::write::FileOptions;

use crate::errors::{CloudBoostclicksError, CloudBoostclicksResult};

pub fn build_zip(files: Vec<(String, Vec<u8>)>) -> CloudBoostclicksResult<Vec<u8>> {
    let mut buffer = std::io::Cursor::new(Vec::new());
    let mut zip = zip::ZipWriter::new(&mut buffer);
    let options = FileOptions::default().compression_method(zip::CompressionMethod::Deflated);

    for (path, data) in files {
        zip.start_file(path, options)
            .map_err(|_| CloudBoostclicksError::Unknown)?;
        zip.write_all(&data)
            .map_err(|_| CloudBoostclicksError::Unknown)?;
    }

    zip.finish()
        .map_err(|_| CloudBoostclicksError::Unknown)?;

    Ok(buffer.into_inner())
}
