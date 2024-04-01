library(tidyverse)

band_report = read_csv('./data_management/bands_1708379032282.csv') 
cemave_report = read_csv('./data_management/relatorio_cemave.csv')%>%mutate(reported=!is.na(reported))

band_report%>%filter(bandNumber=='C75191')

full_report = left_join(cemave_report, band_report, by=c('band_number'='bandNumber'))

notOnTrogon = full_report%>%filter(is.na(captures))

## De quando sao essas anilhas?
notOnTrogon%>%group_by(distribution)%>%summarize(n=n())
## 1 anilha nao esta no Trogon, de 19/05/2022
## 600 anilhas nao estao no Trogon, de 21/12/2023

notReportedWithCaptures = full_report%>%filter(!reported &  captures>0)


onTrogonNotInCemave = band_report%>%left_join(cemave_report, by=c('bandNumber'='band_number'))%>%filter(is.na(size))
