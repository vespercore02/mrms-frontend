export const buildRecordsSeriesOptions = (seriesList = []) => {
  return seriesList.flatMap((series) => {
    const specifics = series.Specifics || [];

    if (specifics.length === 0) {
      return [
        {
          value: `series:${series.SeriesID}`,
          seriesId: series.SeriesID,
          specificId: null,
          itemNo: series.ItemNoID,
          seriesName: series.SeriesName,
          specificName: null,
          retentionPeriod: series.RetentionPeriod,
          label: `${series.ItemNoID} - ${series.SeriesName}`,
        },
      ];
    }

    return specifics.map((specific) => ({
      value: `specific:${specific.SpecificID}`,
      seriesId: series.SeriesID,
      specificId: specific.SpecificID,
      itemNo: series.ItemNoID,
      seriesName: series.SeriesName,
      specificName: specific.SpecificName,
      retentionPeriod:
        specific.RetentionPeriod || series.RetentionPeriod,
      label: `${series.ItemNoID} - ${series.SeriesName} - ${specific.SpecificName}`,
    }));
  });
};